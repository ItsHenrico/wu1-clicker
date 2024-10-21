/* Med document.queryselector(selector) kan vi hämta
 * de element som vi behöver från html dokumentet.
 * Vi spearar elementen i const variabler då vi inte kommer att
 * ändra dess värden.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 * Viktigt: queryselector ger oss ett html element eller flera om det finns.
 */
const clickerButton = document.querySelector('#game-button');
const clickerBackground = document.querySelector('.game-controls');
const moneyTracker = document.querySelector('#money');
const mpsTracker = document.querySelector('#mps'); // money per second
const mpcTracker = document.querySelector('#mpc'); // money per click
//const upgradesTracker = document.querySelector('#upgrades');
const upgradeList = document.querySelector('#upgradelist');
const msgbox = document.querySelector('#msgbox');
const audioAchievement = document.querySelector('#swoosh');
const audioUpgradeSuccess = document.querySelector('#upgradeSuccess');
const audioUpgradeFail = document.querySelector('#upgradeFail');
const audioClick = document.querySelector('#click');

/* Följande variabler använder vi för att hålla reda på hur mycket pengar som
 * spelaren, har och tjänar.
 * last används för att hålla koll på tiden.
 * För dessa variabler kan vi inte använda const, eftersom vi tilldelar dem nya
 * värden, utan då använder vi let.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
 */
let money = 0;
let moneyPerClick = 1;
let moneyPerSecond = 0;
let acquiredUpgrades = 0;
let last = 0;
let numberOfClicks = 0; // hur många gånger har spelare eg. klickat
let active = false; // exempel för att visa att du kan lägga till klass för att indikera att spelare får valuta

// likt upgrades skapas här en array med objekt som innehåller olika former
// av achievements.
// requiredSOMETHING är vad som krävs för att få dem

let achievements = [
    {
        description: 'Wow, du uppgraderade',
        requiredUpgrades: 1,
        acquired: false,
    },
    {
        description: 'Wow, du uppgraderade mer',
        requiredUpgrades: 10,
        acquired: false,
    },
    {
        description: 'No way du klickar',
        requiredClicks: 10,
        acquired: false,
    },
    {
        description: 'Varför spelar du fortfarande?',
        requiredClicks: 10000,
        acquired: false,
    },
];

/* Med ett valt element, som knappen i detta fall så kan vi skapa listeners
 * med addEventListener så kan vi lyssna på ett specifikt event på ett html-element
 * som ett klick.
 * Detta kommer att driva klickerknappen i spelet.
 * Efter 'click' som är händelsen vi lyssnar på så anges en callback som kommer
 * att köras vi varje klick. I det här fallet så använder vi en anonym funktion.
 * Koden som körs innuti funktionen är att vi lägger till moneyPerClick till
 * money.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 */
clickerButton.addEventListener(
    'click',
    () => {
        audioClick.cloneNode().play();
        // vid click öka score med moneyPerClick
        money += moneyPerClick;
        // håll koll på hur många gånger spelaren klickat
        numberOfClicks += 1;
        // console.log(clicker.score);

        clickerButton.classList.remove('sizeChangeButton');
        clickerBackground.classList.remove('sizeChange');

        void clickerButton.offsetWidth;
        void clickerBackground.offsetWidth;

        clickerButton.classList.add('sizeChangeButton');
        clickerBackground.classList.add('sizeChange');

        const mpc = document.createElement("p");
        let x = event.pageX;
        let y = event.pageY;

        mpc.style.position = "fixed";
        mpc.style.left = (x - 30 + (Math.random() * 20)) + "px";
        mpc.style.top = (y - 30 + (Math.random() * 20)) + "px";
        mpc.style.opacity = 1;
        mpc.style.color = "#000000";

        mpc.textContent = ("+" + moneyPerClick);

        clickerButton.appendChild(mpc)

        setInterval(function () {
            if (mpc.style.opacity > 0) {
                mpc.style.opacity -= 0.1;
            } else{
                mpc.remove(mpc)
            }
        }, 200);
    },
    false
);

/* För att driva klicker spelet så kommer vi att använda oss av en metod som heter
 * requestAnimationFrame.
 * requestAnimationFrame försöker uppdatera efter den refresh rate som användarens
 * maskin har, vanligtvis 60 gånger i sekunden.
 * Läs mer: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
 * funktionen step används som en callback i requestanaimationframe och det är
 * denna metod som uppdaterar webbsidans text och pengarna.
 * Sist i funktionen så kallar den på sig själv igen för att fortsätta uppdatera.
 */

moneyTranslator = [
    {
        number: 1,
        suffix: ""
    },
    {
        number: 1000,
        suffix: "k"
    },
    {
        number: 10 ** 6,
        suffix: "M"
    },
    {
        number: 10 ** 9,
        suffix: "B"
    },
    {
        number: 10 ** 12,
        suffix: "T"
    },
]

function step(timestamp) {
    moneyTranslator.forEach(moneyTranslator => {
        if (money >= moneyTranslator.number) {
            moneyTracker.textContent = Math.floor((money / moneyTranslator.number) * 10) / 10 + moneyTranslator.suffix
        }
        if (money < 1000) {
            moneyTracker.textContent = Math.floor(money);
        }
    })

    moneyTranslator.forEach(moneyTranslator => {
        if (moneyPerSecond >= moneyTranslator.number) {
            mpsTracker.textContent = Math.floor((moneyPerSecond / moneyTranslator.number) * 10) / 10 + moneyTranslator.suffix
        }
        if (moneyPerSecond < 1000) {
            mpsTracker.textContent = Math.floor(moneyPerSecond);
        }
    })

    //mpcTracker.textContent = moneyPerClick;
    //upgradesTracker.textContent = acquiredUpgrades;

    money += (moneyPerSecond / 60);

    if (moneyPerSecond > 0 && !active) {
        mpsTracker.classList.add('active');
        active = true;
    }

    // achievements, utgår från arrayen achievements med objekt
    // koden nedan muterar (ändrar) arrayen och tar bort achievements
    // som spelaren klarat
    // villkoren i första ifsatsen ser till att achivments som är klarade
    // tas bort. Efter det så kontrolleras om spelaren har uppfyllt kriterierna
    // för att få den achievement som berörs.
    achievements = achievements.filter((achievement) => {
        if (achievement.acquired) {
            return false;
        }
        if (
            achievement.requiredUpgrades &&
            acquiredUpgrades >= achievement.requiredUpgrades
        ) {
            achievement.acquired = true;
            message(achievement.description, 'achievement');
            return false;
        } else if (
            achievement.requiredClicks &&
            numberOfClicks >= achievement.requiredClicks
        ) {
            achievement.acquired = true;
            message(achievement.description, 'achievement');
            return false;
        }
        return true;
    });

    window.requestAnimationFrame(step);
}

/* Här använder vi en listener igen. Den här gången så lyssnar iv efter window
 * objeket och när det har laddat färdigt webbsidan(omvandlat html till dom)
 * När detta har skett så skapar vi listan med upgrades, för detta använder vi
 * en forEach loop. För varje element i arrayen upgrades så körs metoden upgradeList
 * för att skapa korten. upgradeList returnerar ett kort som vi fäster på webbsidan
 * med appendChild.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 * Efter det så kallas requestAnimationFrame och spelet är igång.
 */
window.addEventListener('load', (event) => {
    upgrades.forEach((upgrade) => {
        upgradeList.appendChild(createCard(upgrade));
    });
    window.requestAnimationFrame(step);
});

/* En array med upgrades. Varje upgrade är ett objekt med egenskaperna name, cost
 * och amount. Önskar du ytterligare text eller en bild så går det utmärkt att
 * lägga till detta.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
 */
upgrades = [
    {
        name: '+1',
        cost: 10,
        amount: 1,
    },
    {
        name: '+0.5 per click',
        cost: 50,
        clicks: 0.5,
    },
    {
        name: '+10',
        cost: 100,
        amount: 10,
    },
    {
        name: '+100',
        cost: 1000,
        amount: 100,
    },
    {
        name: '+1k',
        cost: 10000,
        amount: 1000,
    },
    {
        name: '+10k',
        cost: 100000,
        amount: 10000,
    },
    {
        name: '+1 per click',
        cost: 5000,
        clicks: 1,
    },
    {
        name: '+100k',
        cost: 1000000,
        amount: 100000,
    },
    {
        name: '+1M',
        cost: 10000000,
        amount: 1000000,
    },
    {
        name: '+10M',
        cost: 100000000,
        amount: 10000000,
    },
    {
        name: '+100M',
        cost: 1000000000,
        amount: 100000000,
    },
    {
        name: '+1B',
        cost: 10000000000,
        amount: 1000000000,
    },
    {
        name: '+2 per click',
        cost: 50000,
        clicks: 2,
    },
];

/* createCard är en funktion som tar ett upgrade objekt som parameter och skapar
 * ett html kort för det.
 * För att skapa nya html element så används document.createElement(), elementen
 * sparas i en variabel så att vi kan manipulera dem ytterligare.
 * Vi kan lägga till klasser med classList.add() och text till elementet med
 * textcontent = 'värde'.
 * Sedan skapas en listener för kortet och i den hittar vi logiken för att köpa
 * en uppgradering.
 * Funktionen innehåller en del strängar och konkatenering av dessa, det kan göras
 * med +, variabel + 'text'
 * Sist så fäster vi kortets innehåll i kortet och returnerar elementet.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
 */
function createCard(upgrade) {
    const card = document.createElement('div');
    card.classList.add('card');
    const header = document.createElement('p');
    header.classList.add('title');
    const cost = document.createElement('p');
    if (upgrade.amount) {
        header.textContent = `${upgrade.name}`;
    } else {
        header.textContent = `${upgrade.name}`;
    }
    moneyTranslator.forEach(moneyTranslator => {
        if (upgrade.cost >= moneyTranslator.number) {
            cost.textContent = Math.floor((upgrade.cost / moneyTranslator.number) * 10) / 10 + moneyTranslator.suffix;
        }
    })

    card.addEventListener('click', () => {
        if (money >= upgrade.cost) {
            audioUpgradeSuccess.cloneNode().play();
            acquiredUpgrades++;
            money -= upgrade.cost;
            upgrade.cost *= 1.5;
            moneyTranslator.forEach(moneyTranslator => {
                if (upgrade.cost >= moneyTranslator.number) {
                    cost.textContent = Math.floor((upgrade.cost / moneyTranslator.number) * 10) / 10 + moneyTranslator.suffix;
                }
                if (upgrade.cost < 1000) {
                    cost.textContent = Math.floor(upgrade.cost);
                }
            })

            card.classList.add('boughtSuccess');
            setTimeout(() => {
                card.classList.remove('boughtSuccess')
            }, 1000)

            moneyPerSecond += upgrade.amount ? upgrade.amount : 0;
            moneyPerClick += upgrade.clicks ? upgrade.clicks : 0;
        } else {
            audioUpgradeFail.cloneNode().play();
            card.classList.add('boughtFail');
            setTimeout(() => {
                card.classList.remove('boughtFail')
            }, 1000)
        }
    });

    card.appendChild(header);
    card.appendChild(cost);

    return card;
}

/* Message visar hur vi kan skapa ett html element och ta bort det.
 * appendChild används för att lägga till och removeChild för att ta bort.
 * Detta görs med en timer.
 * Läs mer:
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
 */
function message(text, type) {
    const p = document.createElement('p');
    p.classList.add(type);
    p.textContent = text;
    msgbox.appendChild(p);
    if (type === 'achievement') {
        audioAchievement.play();
    }
    setTimeout(() => {
        p.parentNode.removeChild(p);
    }, 2000);
}