FROM node:alpine

# Labels for GitHub to read the action
LABEL "com.github.actions.name"="Publish release"
LABEL "com.github.actions.description"="Publishes the release of this library"
LABEL "com.github.actions.icon"="arrow-up-circle"
LABEL "com.github.actions.color"="gray-dark"

COPY publish_release /usr/bin/publish_release

ENTRYPOINT ["publish_release"]
