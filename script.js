/*
 *TODO: Add way to remove row from today's calories.
 *TODO: Change view to better one, when on mobile (increase font size, layout)
 *TODO: Maybe. If note exists, total counts down to note value, if not, total as usual.
 *TODO: Maybe. Change way of filling page with data. One function to do it, it receive object with data, or global object.
 *TODO: Enter(key) to enter calories, additionally to button.
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

let calorieTracker = {};
let calsIn100 = '';
let grams = '';
let myCals = '';

function updateValues() {
  calsIn100 = calsIn100Input.value;
  grams = gramsInput.value;
  myCals = myCalsInput.value;
}

function myCalsHandler(e) {
  if (e.keyCode && (e.keyCode == 13)) {
    addBtnHandler();
    return;
  }
  updateValues();
  if (calsIn100 && myCals) {
    gramsInput.value = Math.floor(100 / (calsIn100 / myCals));
  }
}

function gramsHandler() {
  updateValues();
  if (calsIn100 && grams) {
    myCalsInput.value = Math.ceil(calsIn100 * grams / 100);
  }
}

function addBtnHandler() {
  let ts = Date.now();
  updateValues();
  calorieTracker.today[ts] = myCals;
  totalHandler();
  addTodayRow(myCals, ts);
  saveData();
}

function addTodayRow(row, timestamp) {
  rowsUl.innerHTML = `<li data-id="${timestamp}">${row}</li>` + rowsUl.innerHTML;
}

function totalHandler() {
  totalDiv.innerHTML = (() => {
    var total = 0;
    // console.log(total);
    for (let row in calorieTracker.today) {
      total += +calorieTracker.today[row];
    }
    return total;
  })();
}

function loadData() {
  let storage = localStorage.getItem('calorieTracker');
  if (storage) {
    calorieTracker = JSON.parse(storage) || {};
  }
}

function saveData() {
  let storage = JSON.stringify(calorieTracker);
  localStorage.setItem('calorieTracker', storage);
}

function atAppStart() {
  // calorieTracker = {};
  loadData();
  calorieTracker.todayDate = calorieTracker.todayDate || Date.now();
  calorieTracker.today = calorieTracker.today || {};
  calorieTracker.memo = calorieTracker.memo || '';
  calorieTracker.calorieHistory = calorieTracker.calorieHistory || [];
  
  if (calorieTracker.today.constructor === Array) {
    // console.log('array');
    let i = 0;
    let arr = calorieTracker.today;
    calorieTracker.today = {};
    arr.forEach((row) => {
      calorieTracker.today[i++] = row;
    });
    saveData();
    atAppStart();
    return;
  } else {
    // console.log('object');
  }

  todayToHistory();
  historyRows();
  let { today, memo } = calorieTracker;
  for (let row in today) {
    // console.log(today.value, today[row]);
    addTodayRow(today[row], row);
  }
  totalHandler();
  memoHandler(memo);
}

function memoHandler(memo) {
  if (typeof memo === 'string') {
    memo = memo;
    memoInput.value = memo;
  } else {
    memo = memoInput.value;
    calorieTracker.memo = memo;
    saveData();
  }
}

function historyRows() {
  let rows = '';
  calorieTracker.calorieHistory.forEach((data) => {
    rows += `<div>${data[1]} (${data[0]})</div>`;
  });
  historyDiv.innerHTML = rows;
}

function todayToHistory() {
  let currentDate = Date.now();
  let currentDMY = new Date().toLocaleDateString('en-GB');
  let todayDate = calorieTracker.todayDate;
  if (!todayDate) {
    calorieTracker.todayDate = currentDate;
    saveData();
    return;
  }
  if (new Date(todayDate).toLocaleDateString('en-GB') == currentDMY) {
    // console.log('same day');
    return;
  } else {
    // console.log('other day');
    calorieTracker.calorieHistory.unshift([currentDMY, (() => {
      let total = 0;
      for (let row in calorieTracker.today) {
        total += +calorieTracker.today[row];
      }
      return total;
    })()]);
    calorieTracker.today = [];
    historyRows();
    calorieTracker.todayDate = currentDate;
    saveData();
  }
}

function deleteRow(event) {
  event.stopPropagation();
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
  let parent = event.target.parentNode;
  delete calorieTracker.today[parent.dataset.rowid];
  rowsUl.innerHTML = '';
  for (let row in calorieTracker.today) {
    // console.log(calorieTracker.today.value, calorieTracker.today[row]);
    addTodayRow(calorieTracker.today[row], row);
  }
  saveData();
  totalHandler();
}

atAppStart();

myCalsInput.addEventListener('keyup', myCalsHandler);
gramsInput.addEventListener('keyup', gramsHandler);
addBtn.addEventListener('click', addBtnHandler);
memoInput.addEventListener('keyup', memoHandler);
rowsUl.addEventListener('click', deleteRow);
deleteRowConfirmBtn.addEventListener('click', deleteRowConfirmBtnHandler);
window.addEventListener('click', (e) => {
  if (e.target != deleteRowWindow) {
    deleteRowWindow.classList.add('hidden');
  }
});

document.querySelector('.clearToday').addEventListener('click', () => {
  calorieTracker.today = {};
  saveData();
  atAppStart();
  rowsUl.innerHTML = '';
});