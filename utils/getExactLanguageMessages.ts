import * as fs from 'fs';
const languageMessages = JSON.parse(
  fs.readFileSync('/Users/mohamedibrahim/figma-project/utils/language.json', {
    encoding: 'utf-8',
  }),
);
export const getExactLanguageMessages = (message) => {
  const exactMessage = languageMessages[process.env.LOCAL][message];
  return exactMessage;
};
