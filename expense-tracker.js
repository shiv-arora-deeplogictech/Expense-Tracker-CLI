#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const program = new Command();

program.name("extracker")
.description("A CLI expense tracker tool")
.version("1.0.0");

const DATA_FILE = path.join(__dirname,'expenses.json');

function loadExpenses(){
    if(!fs.existsSync(DATA_FILE)){
        return [];
    }
    try{
        return JSON.parse(fs.readFileSync(DATA_FILE,'utf-8'));
    } catch(err){
        return [];
    }
}
function saveExpenses(expenses){
    fs.writeFileSync(DATA_FILE,JSON.stringify(expenses,null,2));
}

function getNextId(expenses){
    if(expenses.length===0) return 1;
    return Math.max(...expenses.map(exp=>exp.id))+1;
}

program
    .command("add")
    .description("Adding a new expense")
    .requiredOption('--description <description>','Expense description')
    .requiredOption('--amount <amount>', 'Expense amount',parseFloat)
    .action((options)=>{
        const expenses = loadExpenses();

        if(options.amount<0){
            console.error("Amount must be positive.");
            process.exit(1);
        }

        const newExpense = {
            id:getNextId(expenses),
            data: new Date().toISOString().split('T')[0],
            description: options.description,
            amount: options.amount,
        };

        expenses.push(newExpense);
        saveExpenses(expenses);
        console.log(`Successfully saved at ${newExpense.id}`);
    });

    program.command("remove")
    .description("Removing all the expenses")
    .requiredOption("--id <id>","Expense ID",parseInt)
    .action((options)=>{ 
        let expenses= loadExpenses();
        const length = expenses.length;

        expenses = expenses.filter(exp => exp.id !== options.id);

        if(expenses.length === length){
            console.error(`Expense with ID : ${options.id} not found`);
        } else {
            console.log(`Expense with ID ${options.id} deleted successfully`);
        }
        saveExpenses(expenses);
    });


    program.parse(process.argv);