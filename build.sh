if [ -d dist ]; then
    echo "============== Delete dist File ==============="
    rm -rf dist
    fi

echo "============ Build Start ============="
npx tsc 
echo "============ Build Finish ============="