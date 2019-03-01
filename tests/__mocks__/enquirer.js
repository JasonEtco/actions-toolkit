const enquirer = jest.genMockFromModule('enquirer')

let answers

enquirer.prompt = async () => answers
enquirer.__setAnswers = obj => { answers = obj }

module.exports = enquirer
