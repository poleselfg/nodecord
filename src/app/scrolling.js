const scroll = async function autoScroll(page){
    console.log("scrolling");
    return await page.evaluate(async function()  {
        await new Promise( function(resolve, reject) {
            let totalHeight = 0;
            let distance = 1000;
            let timer = setInterval(() => {
                let scrollHeight = 15500;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

module.exports = scroll;