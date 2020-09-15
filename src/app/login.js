const fs = require('fs');
const config = require('../config/config.json');
//const cookies = require('../config/cookies.json');
const DISCORD_BASE_URL = 'https://discord.com';
const sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)) }

const login = async (browser, server, channel) => {
    let page = await browser.newPage();

    //TODO Fix Cookies

    // Check if we have a previous saved session
    /*if (Object.keys(cookies).length) {
        try {
            // Set the saved cookies in the puppeteer browser page
            await page.setCookie(...cookies);

            // Go to Discord message channel
            await page.goto(`${DISCORD_BASE_URL}/channels/${config.server}/${config.channel}`, { waitUntil: 'networkidle2' });
        } catch (error) {
            console.log(`Failed Login: ${error}`);
            return;
        }
    } else {*/
    // Go to Discord Login
    try {
        await page.goto(`${DISCORD_BASE_URL}/login`, { waitUntil: 'networkidle2' });

        // Write username and password
        await page.type('input[name=email]', config.user, { delay: 30 });
        await page.type('input[name=password]', config.password, { delay: 30 });

        // Click login button
        await page.click('button[type=submit]');
    } catch (err) {
        console.log("already logged in");
    }


    // Wait for navigation to finish
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Check if logged in
    try {
        await sleep(1000);
        // Go to facebook group
        await page.goto(`${DISCORD_BASE_URL}/channels/${server}/${channel}`, { waitUntil: 'networkidle2' });
    } catch (error) {
        console.log(`Failed Login: ${error}`);
        return;
    }

    try {
        // Get current browser cookies page session
        let currentCookies = await page.cookies();

        // Fill cookie file
        fs.writeFileSync('./src/config/cookies.json', JSON.stringify(currentCookies));
    } catch (error) {
        console.log(`Failed saving cookies: ${error}`);
        return;
    }
    //}

    return page;
}

module.exports = {
    login
}