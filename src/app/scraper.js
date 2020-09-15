const puppeteer = require("puppeteer");
const login = require("./login");
const selectors = require("../config/selectors.json");
const utils = require("../utils/utils");
const config = require("../config/config.json");
//const scrolling = require("./scrolling");
const sleep = (milliseconds) =>
  new Promise((callback) => setTimeout(callback, milliseconds));

const DISCORD_BASE_URL = "https://discord.com";

const WAIT_TIME = 10000;

const scrape = async () => {
  let groups = config.groups;

  //Start up puppeteer and create a new page
  let browser = await puppeteer.launch({
    headless: false,
  });

  let page;

  for (let i = 0; i < config.server.length; i++) {
    page = await login.login(browser, config.server[i], config.channel[i]);
    await sleep(WAIT_TIME);

    // Obtain all post in screen
    let postsOnScreen = await page.$(selectors.MESSAGES_ON_SCREEN);
    let messages = await postsOnScreen.$$(selectors.MESSAGES);

    let prevAuthor = " ";
    let prevDate = " ";
    let prevTime = " ";

    for (const message of messages) {
      //An article is a content (Posts-Comments-Replies)
      let document = await formatDocument(
        message,
        prevAuthor,
        prevDate,
        prevTime
      );

      prevAuthor = document?.author ? document.author : "pol";
      prevDate = document?.date ? document.date : "pol";
      prevTime = document?.time ? document.time : "pol";

      utils.sendToLogstash(document);
    }
    console.log("waiting to search new server");
    await sleep(WAIT_TIME);
  }

  console.log("<<< THE END >>>");

  await page.close();
  await browser.close();
};

const formatDocument = async (rawMessage, prevAuthor, prevDate, prevTime) => {
  puppeteer
    .launch()
    .then(async (browser) => {
      const page = await browser.newPage();
      page.waitForSelector(selectors.MESSAGE_AUTHOR).then(async () => {
        try {
          let author = prevAuthor;
          let content = "";
          let dateTime = "";

          let date = prevDate;
          let time = prevTime;
          try {
            author = await rawMessage.$eval(
              selectors.MESSAGE_AUTHOR,
              (node) => node.innerText
            );
            dateTime = await rawMessage.$eval(
              selectors.MESSAGE_DATE,
              (node) => node.innerText
            );

            dateTime = formatDate(dateTime);

            date = dateTime[0];
            time = dateTime[1];
          } catch (err) {
            console.log("Acumulated Message" + err);
          }

          try {
            content = await rawMessage.$eval(
              selectors.MESSAGE_CONTENT,
              (node) => node.innerText
            );
          } catch (err) {
            console.log("No content");
          }

          let formatedDocument = {
            author,
            title: author,
            date,
            time,
            category: "Discord",
            content,
            content_type: "message",
            source: `${DISCORD_BASE_URL}/channels/${config.server}/${config.channel}`,
            domain: "discord.com",
            _agent: "Discord Scraper",
            type: config.type,
          };

          return formatedDocument;
        } catch (err) {
          console.log(err);
        }
      });

      browser.close();
    })
    .catch((err) => {
      console.log(err);
    });
};

const formatDate = (dateTime) => {
  formatedDate = ["", ""];

  let day, month, year, time, date;

  // Hoy a las
  if (dateTime.toLowerCase().includes("hoy")) {
    date = new Date();

    day =
      ("" + date.getUTCDate()).length == 1
        ? "0" + date.getUTCDate()
        : date.getUTCDate();
    month =
      ("" + date.getUTCMonth()).length == 1
        ? "0" + (date.getUTCMonth() + 1)
        : date.getUTCMonth() + 1;

    formatedDate[0] = date.getUTCFullYear() + "-" + month + "-" + day;

    time = dateTime.match(/\d+/g);

    if (time[0].length == 1) time[0] = "0" + time[0];
    if (time[1].length == 1) time[0] = "0" + time[1];

    formatedDate[1] = time[0] + ":" + time[1];
  } else if (dateTime.toLowerCase().includes("ayer")) {
    // Ayer a las
    date = new Date();

    day =
      ("" + date.getUTCDate()).length == 1
        ? "0" + (date.getUTCDate() - 1)
        : date.getUTCDate() - 1;
    month =
      ("" + date.getUTCMonth()).length == 1
        ? "0" + (date.getUTCMonth() + 1)
        : date.getUTCMonth() + 1;

    formatedDate[0] = date.getUTCFullYear() + "-" + month + "-" + day;

    time = dateTime.match(/\d+/g);

    if (time[0].length == 1) time[0] = "0" + time[0];
    if (time[1].length == 1) time[0] = "0" + time[1];

    formatedDate[1] = time[0] + ":" + time[1];
  } else {
    date = dateTime.match(/\d+/g);

    formatedDate[0] = date[2] + "-" + date[1] + "-" + date[0];

    time = new Date();

    hours =
      ("" + time.getUTCHours()).length == 1
        ? "0" + time.getUTCHours()
        : time.getUTCHours();
    minutes =
      ("" + time.getUTCMinutes()).length == 1
        ? "0" + time.getUTCMinutes()
        : time.getUTCMinutes();

    formatedDate[1] = hours + ":" + minutes;
  }

  return formatedDate;
};

module.exports = {
  scrape,
};
