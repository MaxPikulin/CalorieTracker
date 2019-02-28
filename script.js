const calsIn100Input = document.querySelector('.calsIn100');
const gramsInput = document.querySelector('.grams');
const myCalsInput = document.querySelector('.myCals');
const memoInput = document.querySelector('input.memo');
const resultDiv = document.querySelector('.result');
const addBtn = document.querySelector('.addBtn');
const rowsUl = document.querySelector('.rowsUl');
const totalDiv = document.querySelector('.total');
const totalLeftDiv = document.querySelector('.totalLeft');
const historyDiv = document.querySelector('.history');
const deleteRowWindow = document.querySelector('.deleteRowWindow');
const deleteRowConfirmBtn = document.querySelector('.deleteRowConfirmBtn');
const clearTodayBtn = document.querySelector('.clearToday');
const toEatDiv = document.querySelector('.toeat');
const fastedChb = document.querySelector('#fasted');
const toEatLeftDiv = document.querySelector('.toeat-left');

let calorieTracker = {};
let calsIn100 = '';
let grams = '';
let myCals = '';

function updateValues() {
  calsIn100 = calsIn100Input.value;
  grams = gramsInput.value;
  myCals = myCalsInput.value;
}

function myCalsHandler(calsIn100, myCals) {
  if (calsIn100 && myCals) {
    return Math.floor(100 / (calsIn100 / myCals));
  }
  return '';
}

function gramsHandler(calsIn100, grams) {
  if (calsIn100 && grams) {
    return Math.ceil(calsIn100 * grams / 100);
  }
  return '';
}

function addBtnHandler(myCals) {
  let ts = Date.now();
  return {
    [ts]: myCals
  };
}

function addTodayRow(row, timestamp) {
  return `<li data-id="${timestamp}">${row}</li>`;
}

function addAllTodayRows(today) {
  let result = '';
  for (let row in today) {
    result += addTodayRow(today[row], row);
  }
  return result;
}

function totalHandler(today) {
  var total = 0;
  for (let row in today) {
    total += +today[row];
  }
  return total;
}

function loadData(object) {
  let storage = localStorage.getItem(object);
  if (storage) return JSON.parse(storage);
  else return {};
}

function saveData(calorieTracker, name) {
  let storage = JSON.stringify(calorieTracker);
  localStorage.setItem(name, storage);
}

function memoHandler(memo) {
  if (!memo) return '';
  return memo;
}

function historyRows(history, memo) {
  const nameOfDay = (string) => {
    let date = string.split('/').reverse();
    date = new Date(date).toString().slice(0, 3);
    return date;
  }
  if (!history) return '';
  let rows = '';
  let length = history.length;
  let total = 0;
  let daysOfWeek = 0;
  for (let i = length - 1; i >= 0; i--) {
    let row = history[i];
    let day = nameOfDay(row[0]);
    daysOfWeek++;
    total += +row[1];
    let weekly = '';
    if (day == 'Sun' || i == 0) {
      toEat(memo, total);
      weekly = ` Total: ${total} avg: ${Math.ceil(total / daysOfWeek)}`;
      total = daysOfWeek = 0;
    }
    rows = `<div>${row[1]} (${row[0]}) ${day}.${weekly}</div>` + rows;
  }
  return rows;
}

function sameDay(todayDate) {
  let currentDMY = new Date().toLocaleDateString('en-GB');
  if (new Date(todayDate).toLocaleDateString('en-GB') == currentDMY)
    return true; // same day
  else
    return false; // other day
}

function todayToHistory(today, todayDate) {
  let currentDMY = new Date(todayDate).toLocaleDateString('en-GB');
  return [currentDMY, totalHandler(today)];
}

function deleteRow(event) {
  let positionTarget = event.target.getBoundingClientRect();
  let positionWindow = deleteRowWindow.getBoundingClientRect();
  let middleTarget = positionTarget.height / 2;
  let middleWindow = positionWindow.height / 2;
  deleteRowWindow.style.top = `${positionTarget.top + middleTarget - middleWindow}px`;
  deleteRowWindow.style.left = `${positionTarget.left + positionTarget.width + 20}px`;
  deleteRowWindow.dataset.rowid = event.target.dataset.id;
  deleteRowWindow.classList.remove('hidden');
}

function toEat(memo, weekTotal) {
  let normDay = new Date().getDay();
  let fastedChecked = +fastedChb.checked;
  if (normDay == 0) {
    normDay = 6;
    fastedChecked = 0;
  } else {
    normDay--;
  }
  let daysLeft = 7 - normDay - fastedChecked;
  let weeklyLimit = memo * 7;
  let amountLeft = weeklyLimit - (normDay === 0 ? 0 : weekTotal);
  let dailyAvg = Math.floor(amountLeft / daysLeft);
  toEatDiv.classList.remove('green', 'red');
  if (dailyAvg > memo) {
    toEatDiv.classList.add('green');
    toEatDiv.classList.remove('red');
  } else if (dailyAvg < memo) {
    toEatDiv.classList.add('red');
    toEatDiv.classList.remove('green');
  }
  calorieTracker.dailyAvg = dailyAvg;
  toEatDiv.textContent = dailyAvg;
  // ?
  saveData(calorieTracker, 'calorieTracker');
  return dailyAvg;
}

function deleteRowConfirmBtnHandler(event) {
  return event.target.parentNode.dataset.rowid;
}

function mainHandler(event) {
  let target = event.target;

  if (target.parentNode == rowsUl) {
    deleteRow(event);
  } else if (!deleteRowWindow.classList.contains('hidden') && target != deleteRowWindow) {
    deleteRowWindow.classList.add('hidden');
  }
  updateValues();
  if (event.type == 'click') {
    switch (true) {
      case target == addBtn:
        calorieTracker.today = Object.assign(addBtnHandler(myCals), calorieTracker.today);
        break;
      case target == deleteRowConfirmBtn:
        delete calorieTracker.today[deleteRowConfirmBtnHandler(event)];
        break;
      case target == clearTodayBtn:
        calorieTracker.today = {};
        break;
    }
  } else if (event.type == 'keyup') {
    switch (true) {
      case (event.keyCode == 13):
        if (target == myCalsInput || target == gramsInput)
          calorieTracker.today = Object.assign(addBtnHandler(myCals), calorieTracker.today);
        break;
      case target == myCalsInput:
        gramsInput.value = myCalsHandler(calsIn100, myCals);
        break;
      case target == gramsInput:
        myCalsInput.value = gramsHandler(calsIn100, grams);
        break;
      case target == memoInput:
        calorieTracker.memo = memoHandler(memoInput.value);
    }
  }
  fillPage(calorieTracker);
}

function fillPage(calorieTracker) {
  saveData(calorieTracker, 'calorieTracker');
  let { today, memo, calorieHistory, dailyAvg } = calorieTracker;
  rowsUl.innerHTML = addAllTodayRows(today);
  memoInput.value = memoHandler(memo);
  let total = totalHandler(today);
  totalLeftDiv.innerHTML = 'Left: ' + (memo - total);
  totalDiv.innerHTML = 'Total: ' + total;
  toEatLeftDiv.textContent = `(${dailyAvg ? dailyAvg - total : ''})`;
  historyDiv.innerHTML = historyRows(calorieHistory, memo);
}

function onLoad() {
  calorieTracker = {};
  calorieTracker = loadData('calorieTracker');
  calorieTracker.todayDate = calorieTracker.todayDate || Date.now();
  calorieTracker.today = calorieTracker.today || {};
  calorieTracker.memo = calorieTracker.memo || '';
  calorieTracker.calorieHistory = calorieTracker.calorieHistory || [];

  //temp to fix datas, then delete "fixed" prop.
  if (calorieTracker.fixed) {
    delete calorieTracker.fixed;
    saveData(calorieTracker, 'calorieTracker');
  }
  //temp

  let { todayDate, today } = calorieTracker;
  if (!sameDay(todayDate)) {
    calorieTracker.calorieHistory.unshift(todayToHistory(today, todayDate));
    calorieTracker.todayDate = Date.now();
    calorieTracker.today = {};
  }
  fillPage(calorieTracker);
}

onLoad();

document.addEventListener('click', mainHandler);
document.addEventListener('keyup', mainHandler);
// window events.
window.addEventListener('focus', () => onLoad());