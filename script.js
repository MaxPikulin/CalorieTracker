const calsIn100Input = document.querySelector('.calsIn100');
const gramsInput = document.querySelector('.grams');
const myCalsInput = document.querySelector('.myCals');
const memoInput = document.querySelector('input.memo');
const resultDiv = document.querySelector('.result');
const addBtn = document.querySelector('.addBtn');
const rowsUl = document.querySelector('.rowsUl');
const totalDiv = document.querySelector('.total');

let calorieTracker = {
  today: [],
};

let calsIn100 = calsIn100Input.value;
let grams = gramsInput.value;
let myCals = myCalsInput.value;

function updateValues() {
  calsIn100 = calsIn100Input.value;
  grams = gramsInput.value;
  myCals = myCalsInput.value;
}

function myCalsHandler() {
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
  updateValues();
  calorieTracker.today.push(myCals);
  totalHandler();
  addTodayRow(myCals);
  saveData();
}

function addTodayRow(row) {
  rowsUl.innerHTML = `<li>${row}</li>` + rowsUl.innerHTML;
}

function totalHandler() {
  if (calorieTracker.today.length) {
    totalDiv.innerHTML = calorieTracker.today.reduce((acc, curr) => +acc + +curr);
  }
}

function loadData() {
  let storage = localStorage.getItem('calorieTracker');
  calorieTracker = JSON.parse(storage) || {};
}

function saveData() {
  let storage = JSON.stringify(calorieTracker);
  localStorage.setItem('calorieTracker', storage);
}

function atAppStart() {  
  loadData();  
  if (calorieTracker && calorieTracker.today) {    
    calorieTracker.today.forEach((row) => addTodayRow(row));
  } else {    
    calorieTracker = { today: [] };
  }  
  totalHandler();
}

atAppStart();

myCalsInput.addEventListener('keyup', myCalsHandler);
gramsInput.addEventListener('keyup', gramsHandler);
addBtn.addEventListener('click', addBtnHandler);