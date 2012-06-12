// taken from https://developer.mozilla.org/en/JavaScript/Guide/Details_of_the_Object_Model#Class-based_vs._prototype-based_languages

// employee
function Employee (name,dept) {  
  this.name = name || "";  
  this.dept = dept || "general";  
}

// manager
function Manager () {
  this.reports = [];
}
Manager.prototype = new Employee();

// worker bee
function WorkerBee (name,dept,projects) {
  this.base = Employee;
  this.base(name,dept);
  this.projects = projects|| [];
}
WorkerBee.prototype = new Employee();

// sales person
function SalesPerson () {
  this.dept = "sales";
  this.quota = 100;
}
SalesPerson.prototype = new WorkerBee();

// engineer
function Engineer (name,projects,machine) {
  this.base = WorkerBee;
  this.base(name,"engineering",projects);
  this.machine = machine || "";
}
Engineer.prototype = new WorkerBee();
