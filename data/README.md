# 海斗人格测试数据说明

## 文件说明

### `questions.json` - 题库数据结构化文件

包含完整的30道测试题目及其评分规则。

## 数据结构

### 1. 基础信息
```json
{
  "version": "1.0",
  "totalQuestions": 30
}
```

### 2. 维度定义 (dimensions)

五个维度，每个维度有两个倾向：

| 维度ID | 维度名称 | 倾向A | 倾向B |
|--------|---------|-------|-------|
| 0 | 雪球冲锋执念 | 冲脸莽夫 🦁 | 缩头仓鼠 🐹 |
| 1 | 技能释放态度 | 狂甩机器 💥 | 大招收藏家 🔒 |
| 2 | 风险承担觉悟 | 敢死开团手 ✊ | KDA守财奴 💰 |
| 3 | 输出距离偏好 | 贴脸战神 👊 | 墙角POKE怪 🎯 |
| 4 | 游戏核心心态 | 乐子至上 😂 | 赢麻党 🏆 |

### 3. 题目结构 (questions)

每道题包含：
- `id`: 题目编号 (1-30)
- `dimension`: 所属维度ID (0-4)
- `question`: 题目文本
- `options`: 选项数组
  - `key`: 选项编号 (A/B/C)
  - `text`: 选项文本
  - `tendency`: 倾向标识 ("A" / "B" / "neutral")
  - `score`: 分数 (A/B=1, C=0)

### 4. 评分规则 (scoringRules)

- 每题最多1分
- 单个维度6题总分6分
- 某一倾向得分≥4分，即判定为该维度最终倾向
- 若A、B得分持平（均为2-3分），按"就近匹配"原则判定

## 计分逻辑示例

假设用户答题结果：

```javascript
const answers = {
  1: "A",  // 第1题选A → 雪球冲锋执念倾向A +1分
  2: "B",  // 第2题选B → 雪球冲锋执念倾向B +1分
  // ... 其他题目
};
```

计分函数伪代码：

```javascript
function calculateScores(answers) {
  const scores = {
    0: { A: 0, B: 0 },  // 雪球冲锋执念
    1: { A: 0, B: 0 },  // 技能释放态度
    2: { A: 0, B: 0 },  // 风险承担觉悟
    3: { A: 0, B: 0 },  // 输出距离偏好
    4: { A: 0, B: 0 }   // 游戏核心心态
  };

  questions.forEach(q => {
    const answer = answers[q.id];
    if (answer === 'A') {
      scores[q.dimension].A += 1;
    } else if (answer === 'B') {
      scores[q.dimension].B += 1;
    }
    // 选C不计分
  });

  return scores;
}
```

## 人格判定

根据5个维度的得分，组合成32种海斗人格：

例如：
- 🦁💥✊👊😂 = 冲脸莽夫 + 狂甩机器 + 敢死开团手 + 贴脸战神 + 乐子至上
- 🐹🔒💰🎯🏆 = 缩头仓鼠 + 大招收藏家 + KDA守财奴 + 墙角POKE怪 + 赢麻党

## 使用示例

```javascript
import questions from './questions.json';

// 1. 显示题目
function displayQuestion(questionId) {
  const question = questions.questions.find(q => q.id === questionId);
  console.log(`${question.id}. ${question.question}`);
  question.options.forEach(opt => {
    console.log(`${opt.key}. ${opt.text}`);
  });
}

// 2. 计算得分
function calculateResult(userAnswers) {
  // 实现计分逻辑...
  return {
    dimensions: ["A", "B", "A", "A", "B"],  // 5个维度的倾向
    scores: { /* 详细分数 */ },
    personality: "冲脸莽夫+大招收藏家+..."
  };
}
```

## 注意事项

1. **每题3个选项**：A/B对应两个倾向，C为中间态
2. **中间态不计分**：C选项的score为0
3. **得分阈值**：≥4分判定为该倾向
4. **倾向标识**：tendency字段使用 "A"、"B"、"neutral"
5. **维度索引**：0-4对应5个维度，questions中dimension字段使用索引
