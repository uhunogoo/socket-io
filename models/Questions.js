// {
//   "_key": "617b82d45529",
//   "_type": "singleChoiceQuestion",
//   "correctAnswerIndex": 3,
//   "media": {
//     "image": {
//       "height": null,
//       "url": null,
//       "width": null
//     },
//     "url": "https://youtu.be/oncaa_fMsyw?si=pcpsh8qFkkYuxe86"
//   },
//   "options": [
//     "Не правильно",
//     "Не правльно",
//     "Не правльно",
//     "Правильно"
//   ],
//   "questionText": "Тест для перевірки медіа (відео)"
// }
export class Questions {
  constructor( questions = [] ) {
    this.questions = questions;
    this.currentIndex = 0;
  }

  mapQuestion( question ) {
    if (!question) return null;

    const newQuestion = {
      key: question._key,
      type: question._type,
      correctAnswerIndex: question.correctAnswerIndex,
    }

    return newQuestion;
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex] || null;
  }

  getNextQuestion() {
    this.currentIndex++;
    return this.getCurrentQuestion();
  }

  hasMoreQuestions() {
    return this.currentIndex < this.questions.length;
  }

  getTotalQuestions() {
    return this.questions.length;
  }
  
  reset() {
    this.currentIndex = 0;
  }
}
