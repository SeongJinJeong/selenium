if [ -d dist ]; then
    echo "============== Delete dist File ==============="
    rm -rf dist
    fi

npx tsc

npm run start