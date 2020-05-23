## Setup
1. `npm install`

## Run
```
npm run start
```

## Deploy
```
sudo npm install -g pm2
npm run build
pm2 start npm --name 'nextjs-pi-monitor' -- start
```

