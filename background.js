let activeTab
let openTabs = []
let closedTabs = []
let attch = false

let botId = process.env.TGBOT_ID
let channelId = process.env.TGCH_ID
let api = `https://api.telegram.org/bot${botId}`

chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
    activeTab = tab[0]
  })

  chrome.storage.sync.get(["botId", "channelId"], function (result) {
    /* botId = result.botId
    channelId = result.channelId */
    console.log(botId, channelId, api)
  })

  chrome.tabs.onCreated.addListener(function (tab) {
    //yeni bir sekme olusturuldu
    console.log("onCreated : ")
    console.log(tab)

    openTabs.push(tab)
  })

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, newTab) {
    //acik sekmenin icerigi degisti
    if (changeInfo.status == "complete") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
        if (tab[0].status == "complete") {
          if (activeTab?.id != tab[0].id) {
            // yan sekmede acildi
            console.log("yan sekme acildi")
            console.log(newTab)
          } else {
            // su anki sekme degisti

            //kapatilan url ile ilgili islemler
            updateClosedAndOpenTabs(tabId)

            //yeni url ile ilgili islemler
            console.log("su anki sekme degisti")

            if (activeTab.url != newTab.url) {
              let date = `${new Date()}\n${new Date().toLocaleString("tr-TR")}`
              activeTab = newTab
              let text = ""
              if (newTab.url.startsWith("http")) {
                text = `${date}\n==========\n${newTab.title}\n<a href="${newTab.url}">Click</a>`
              } else {
                text = `${date}\n==========\n${newTab.title}\n${newTab.url}`
              }
              postData(`${api}/sendMessage`, {
                chat_id: channelId,
                text: text,
                parse_mode: "HTML",
              }).then((data) => {
                console.log(data) // JSON data parsed by `data.json()` call
              })
            }
          }
        }
      })
    }
  })

  chrome.tabs.onActivated.addListener(function (activeInfo) {
    //kullanici tab degistirdi
    console.log("kullanici tab degistirdi")

    chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
      console.log(tab[0])
      activeTab = tab[0]
    })
  })

  chrome.tabs.onDetached.addListener(function (tabId, detachInfo) {
    console.log("onDetached : ")
    console.log(tabId)
    console.log(detachInfo)

    attch = true
  })
  chrome.tabs.onAttached.addListener(function (tabId, attachInfo) {
    console.log("onAttached : ")
    console.log(tabId)
    console.log(attachInfo)

    attch = false
  })

  chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    //sekme kapandi
    console.log("onRemoved : ")
    console.log(tabId)
    console.log(removeInfo)

    updateClosedAndOpenTabs(tabId)
  })

  chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
    console.log("REPLACED : ")
    console.log(addedTabId)
    console.log(removedTabId)
  })
})

const sendInfo = (tabId, changeInfo, newTab) => {}

const findTab = (mode, id) => {
  switch (mode) {
    case "open":
      return openTabs.find((t) => t.id == id)
    case "closed":
      return closedTabs.find((t) => t.id == id)
    default:
      break
  }
}

const updateClosedAndOpenTabs = (id) => {
  let closedTab = openTabs.indexOf(findTab("open", id))
  closedTabs.push(openTabs[closedTab])
  openTabs.splice(closedTab, 1)
}

// Example POST method implementation:
async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data),
  })
  return response.json()
}
