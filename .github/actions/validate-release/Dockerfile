FROM node:slim

# Labels for GitHub to read the action
LABEL "com.github.actions.name"="Validate release"
LABEL "com.github.actions.description"="Validates the release of this library"
LABEL "com.github.actions.icon"="tag"
LABEL "com.github.actions.color"="gray-dark"

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your action's code
COPY . .

# Run `node /entrypoint.js`
ENTRYPOINT ["node", "/entrypoint.js"]
