/**
 * 海斗人格测试评分工具
 * 用于计算答题结果并生成人格判定
 */

// 导入题目数据（实际使用时调整导入路径）
// import questionsData from './questions.json';

/**
 * 计算用户的维度得分
 * @param {Object} userAnswers - 用户答题对象 {题目ID: 选项}
 * @param {Array} questions - 题目数组
 * @returns {Object} 各维度得分 {dimensionId: {A: number, B: number}}
 */
export function calculateScores(userAnswers, questions) {
  // 初始化5个维度的得分
  const scores = {
    0: { A: 0, B: 0 }, // 雪球冲锋执念
    1: { A: 0, B: 0 }, // 技能释放态度
    2: { A: 0, B: 0 }, // 风险承担觉悟
    3: { A: 0, B: 0 }, // 输出距离偏好
    4: { A: 0, B: 0 }  // 游戏核心心态
  };

  // 遍历所有题目计分
  questions.forEach(question => {
    const answer = userAnswers[question.id];
    if (!answer) return; // 跳过未答题目

    const selectedOption = question.options.find(opt => opt.key === answer);
    if (selectedOption && selectedOption.tendency !== 'neutral') {
      scores[question.dimension][selectedOption.tendency] += selectedOption.score;
    }
  });

  return scores;
}

/**
 * 判断各维度的最终倾向
 * @param {Object} scores - 各维度得分
 * @returns {Array} 5个维度的倾向 ["A" | "B" | "neutral"]
 */
export function determineTendencies(scores) {
  const tendencies = [];
  const threshold = 4; // 得分阈值

  for (let dim = 0; dim < 5; dim++) {
    const scoreA = scores[dim].A;
    const scoreB = scores[dim].B;

    if (scoreA >= threshold) {
      tendencies.push('A');
    } else if (scoreB >= threshold) {
      tendencies.push('B');
    } else {
      // A、B得分均未达到阈值
      if (scoreA > scoreB) {
        tendencies.push('A'); // 靠近A
      } else if (scoreB > scoreA) {
        tendencies.push('B'); // 靠近B
      } else {
        tendencies.push('neutral'); // 持平
      }
    }
  }

  return tendencies;
}

/**
 * 生成人格代码（用于匹配32种人格）
 * @param {Array} tendencies - 5个维度的倾向
 * @returns {String} 人格代码，如 "AABAB"
 */
export function generatePersonalityCode(tendencies) {
  return tendencies.map(t => t.charAt(0).toUpperCase()).join('');
}

/**
 * 获取人格详细信息
 * @param {Array} tendencies - 5个维度的倾向
 * @param {Array} dimensions - 维度定义
 * @returns {Object} 人格描述 {code, name, dimensions, emojis}
 */
export function getPersonalityInfo(tendencies, dimensions) {
  const code = generatePersonalityCode(tendencies);
  const emojis = tendencies.map((t, i) => {
    return t === 'A' ? dimensions[i].emojiA : dimensions[i].emojiB;
  }).join('');
  const dimensionNames = dimensions.map((dim, i) => {
    return t === 'A' ? dim.tendencyA : dim.tendencyB;
  }).join('+');

  return {
    code,
    emojis,
    dimensionNames,
    fullDescription: `${emojis} ${dimensionNames}`
  };
}

/**
 * 完整的评分流程
 * @param {Object} userAnswers - 用户答题 {题目ID: 选项}
 * @param {Object} questionsData - 题目数据对象
 * @returns {Object} 完整评分结果
 */
export function calculateResult(userAnswers, questionsData) {
  // 计算得分
  const scores = calculateScores(userAnswers, questionsData.questions);

  // 判定倾向
  const tendencies = determineTendencies(scores);

  // 生成人格信息
  const personality = getPersonalityInfo(tendencies, questionsData.dimensions);

  // 返回完整结果
  return {
    scores,
    tendencies,
    personality,
    dimensionDetails: tendencies.map((t, i) => ({
      dimension: questionsData.dimensions[i].name,
      dimensionId: i,
      tendency: t,
      tendencyName: t === 'A' ? questionsData.dimensions[i].tendencyA :
                       t === 'B' ? questionsData.dimensions[i].tendencyB : '中间态',
      emoji: t === 'A' ? questionsData.dimensions[i].emojiA :
             t === 'B' ? questionsData.dimensions[i].emojiB : '⚪',
      scoreA: scores[i].A,
      scoreB: scores[i].B,
      scoreTotal: scores[i].A + scores[i].B
    }))
  };
}

/**
 * 生成雷达图数据
 * @param {Array} dimensionDetails - 维度详细信息
 * @returns {Object} 雷达图数据格式
 */
export function generateRadarData(dimensionDetails) {
  // 将倾向转换为百分比（A=100, B=0, neutral=50）
  return dimensionDetails.map(dim => {
    let percentage;
    if (dim.tendency === 'A') {
      percentage = 100;
    } else if (dim.tendency === 'B') {
      percentage = 0;
    } else {
      // 中间态，根据A和B的得分计算百分比
      const total = dim.scoreTotal || 1;
      percentage = Math.round((dim.scoreA / total) * 100);
    }
    return {
      dimension: dim.dimension,
      percentage
    };
  });
}

/**
 * 验证答题完整性
 * @param {Object} userAnswers - 用户答题
 * @param {Number} totalQuestions - 题目总数
 * @returns {Object} 验证结果 {isValid, answeredCount, missingQuestions}
 */
export function validateAnswers(userAnswers, totalQuestions) {
  const answeredCount = Object.keys(userAnswers).length;
  const missingQuestions = [];

  for (let i = 1; i <= totalQuestions; i++) {
    if (!userAnswers[i]) {
      missingQuestions.push(i);
    }
  }

  return {
    isValid: missingQuestions.length === 0,
    answeredCount,
    missingQuestions,
    completeness: `${answeredCount}/${totalQuestions}`
  };
}

// 使用示例（注释掉，实际使用时取消注释）
/*
const userAnswers = {
  1: 'A',
  2: 'B',
  3: 'A',
  // ... 其他答题
};

const result = calculateResult(userAnswers, questionsData);
console.log('人格代码:', result.personality.code);
console.log('人格描述:', result.personality.fullDescription);
console.log('雷达图数据:', generateRadarData(result.dimensionDetails));
*/
