FROM node:slim

# Labels for GitHub to read your action
LABEL "com.github.actions.name"="Your action name"
LABEL "com.github.actions.description"="A description of your action"
LABEL "com.github.actions.icon"="play"
LABEL "com.github.actions.color"="gray-dark"

COPY package*.json ./
RUN npm ci
COPY . .
ENTRYPOINT ["node", "/entrypoint.js"]
