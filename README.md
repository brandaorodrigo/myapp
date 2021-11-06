npx create-react-app spot --template typescript

npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-airbnb-typescript eslint-plugin-jest

npx install-peerdeps --dev eslint-config-airbnb

npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier

npm install --save-dev react-router-dom @types/react-router-dom antd moment

https://www.npmjs.com/package/cra-template-ts-prettier-eslint-airbnb

npm eslint --init

npm cache clean --force

rm -rf node_modules

rm -rf package-lock.json

ssh-keygen -t rsa -C "your.email@example.com" -b 4096

// fetchSpot is a complete standalone function
// to connect and query API from spot metrics
// - autosave and read the params from localStorage
// - indetify the env from dns domain
// - save result cache on sessionStorage
// - fiscal redirect to /logout if recive forbidden from api
// - accept raw value to send files or object values to send json
