/*
 *
 *TODO: Change view to better one, when on mobile (increase font size, layout)
 *TODO: Maybe. If note exists, total counts down to note value, if not, total as usual.
 *TODO: Maybe. Change way of filling page with data. One function to do it, it receive object with data, or global object.
 *
 *
 */

const calsIn100Input = document.querySelector('.calsIn100');
const gramsInput = document.querySelector('.grams');
const myCalsInput = document.querySelector('.myCals');
const memoInput = document.querySelector('input.memo');
const resultDiv = document.querySelector('.result');
const addBtn = document.querySelector('.addBtn');
const rowsUl = document.querySelector('.rowsUl');
const totalDiv = document.querySelector('.total');
const historyDiv = document.querySelector('.history');
const deleteRowWindow = document.querySelector('.deleteRowWindow');
const deleteRowConfirmBtn = document.querySelector('.deleteRowConfirmBtn');
const clearTodayBtn = document.querySelector('.clearToday');

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
  calorieTracker.today[ts] = myCals;
  totalHandler();
  addTodayRow(myCals, ts);
}

function addTodayRow(row, timestamp) {
  return `<li data-id="${timestamp}">${row}</li>`;
}

function addAllTodayRows(today) {
  let result = '';
  for (let row in today) {
    result = addTodayRow(today[row], row) + result;
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
  return memo;
}

function historyRows(calorieHistory) {
  let rows = '';
  calorieHistory.forEach((data) => {
    rows += `<div>${data[1]} (${data[0]})</div>`;
  });
  return rows;
}

function sameDay(todayDate) {
  let currentDMY = new Date().toLocaleDateString('en-GB');
  if (new Date(todayDate).toLocaleDateString('en-GB') == currentDMY)
    return true; // same day
  else
    return false; // other day
}

function todayToHistory(today) {
  let currentDMY = new Date().toLocaleDateString('en-GB');
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

function deleteRowConfirmBtnHandler(event) {
  return event.target.parentNode.dataset.rowid;
}

function mainHandler(event) {
  let target = event.target;

  console.log(event);
  if (target.parentNode == rowsUl) {
    deleteRow(event);
  } else if (!deleteRowWindow.classList.contains('hidden') && target != deleteRowWindow) {
    deleteRowWindow.classList.add('hidden');
  }
  updateValues();
  if (event.type == 'click') {
    switch (true) {
      case target == addBtn:
        addBtnHandler(myCals);
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
      case (event.keyCode == 13 && target == myCalsInput):
        addBtnHandler(myCals);
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
  saveData(calorieTracker, 'calorieTracker');
  fillPage(calorieTracker);
}

function fillPage(calorieTracker) {
  let { today, memo, calorieHistory } = calorieTracker;
  rowsUl.innerHTML = addAllTodayRows(today);
  memoInput.value = memo;
  totalDiv.innerHTML = totalHandler(today);
  historyDiv.innerHTML = historyRows(calorieHistory);
}

function onLoad() {
  let calorieTracker = {};
  calorieTracker = loadData('calorieTracker');
  calorieTracker.todayDate = calorieTracker.todayDate || Date.now();
  calorieTracker.today = calorieTracker.today || {};
  calorieTracker.memo = calorieTracker.memo || '';
  calorieTracker.calorieHistory = calorieTracker.calorieHistory || [];

  let { todayDate, today } = calorieTracker;
  if (!sameDay(todayDate)) {
    calorieTracker.calorieHistory.unshift(todayToHistory(today));
    calorieTracker.todayDate = Date.now();
    calorieTracker.today = {};
  }
  fillPage(calorieTracker);
}

onLoad();

document.addEventListener('click', mainHandler);
document.addEventListener('keyup', mainHandler);