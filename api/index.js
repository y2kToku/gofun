const express = require("express");
const app = express();
const puppeteer = require('puppeteer')


// 定数系
const headless = false
const slowMo = 50
const width = 800
const height = 800
const args = [
  // '--start-fullscreen',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-web-security',
  '--ignore-certificate-errors',
  '--allow-external-pages',
  '--disable-site-isolation-for-policy'
];

const TOP_PAGE = 'https://delishkitchen.tv/';
const KEY_WORDS = '春巻き'

app.get("/", function (req, res, next) {
  try {
    let a = ["111", "222"]
    let b = ["肉", "魚"]
    // let c = _.object(a, b)
    // res.send(c);
    let d = _.concat(a, b)
    res.send(d)
  } catch (error) {
    next(error)
  }
});

// ページにアクセスして、検索ワードを入力して画面遷移する
app.get("/recipes", async (req, res, next) => {
  try {
    const browser = await puppeteer.launch({
      headless,
      slowMo,
      args,
      dumpio: true
    })
    // トップページを開く
    const topPage = await browser.newPage()
    await topPage.setViewport({ width, height })
    await topPage.goto(TOP_PAGE, {
      waitUntil: 'networkidle2'
    })
    // 検索セレクタを指定する
    const searchSelector = '#__layout > div > div.delish-header > div.delish-header-pc-content > header > div.delish-search-form.search-form > form > input[type=text]';
    // 検索セレクタに検索ワードを入力する
    await topPage.type(searchSelector, KEY_WORDS);
    // Enterキーを押す
    await topPage.keyboard.press("Enter");
    // 画面表示を待つ
    await topPage.waitForNavigation({ waitUntil: ["load", "networkidle2"] });

    console.log('画面表示待ってる')

    // レシピURLを取得する
    const recipeURLSelector = 'div.delish-recipe-item-card > a';
    // レシピURL一覧データを取得する（1ページ目のみ）
    const recipeUrls = await topPage.$$eval(recipeURLSelector, list => {
      let datas = [];
      for (let i = 0; i < list.length; i++) {
        datas.push(list[i].href);
      }
      return datas;
    });
    // レシピタイトルを取得する
    const recipeTitleSelector = 'div.delish-recipe-item-card > div.item-card__title-wrap > p.item-card__title text-bold';
    // レシピタイトル一覧データを取得する（1ページ目のみ）
    const recipeTitles = await topPage.$$eval(recipeTitleSelector, list => {
      let datas = [];
      for (let i = 0; i < list.length; i++) {
        datas.push(list[i].textContent);
      }
      return datas;
    });

    console.log('レシピ加工前ーーー')

    // 「レシピタイトル: URL」のobjectに整形する（lodash.object()）
    const recipeDatas = _.object(recipeTitles, recipeUrls)

    console.log('recipeDatas => ', recipeDatas)
    res.json(recipeDatas)
    // console.log('recipeUrls => ', recipeUrls)
    // res.json(recipeUrls);

    // ブラウザを終了する
    await topPage.close()
    await browser.close()
  } catch (error) {
    next(error)
  }
})

module.exports = {
  path: "/api/",
  handler: app
};
