const enquirer = jest.genMockFromModule('enquirer')

let answers

enquirer.prompt = jest.fn(async () => answers)
enquirer.__setAnswers = obj => { answers = obj }

module.exports = enquirer
