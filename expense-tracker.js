#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { Command, action, option } = require("commander");
const program = new Command();

program.name("extracker")
.description("A CLI expense tracker tool")
.version("1.0.0");

const DATA_FILE = path.join(__dirname,'expenses.json');

function loadExpenses() {
    if (!fs.existsSync(DATA_FILE)) {
        console.log("🚨 File does not exist. Returning empty array.");
        return [];
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsedData = JSON.parse(data);
        if (!Array.isArray(parsedData)) {
            console.error("🚨 Data is not an array. Resetting file.");
            return [];
        }
        return parsedData;
    } catch (err) {
        console.error("🚨 Error loading expenses:", err);
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

    program
    .command("view")
        .description("Show all the expenses")
        .action(()=>{
            let expenses = loadExpenses();

            if(expenses.length===0){
                console.error("No expenses found");
            } else {
                console.table(expenses);
            }
        });

        program
    .command("update")
    .description("Update the expenses")
    .requiredOption("--id <id>", "Expense ID", parseInt)
    .option("--description <description>", "New Description")
    .option("--amount <amount>", "New Amount", parseFloat)
    .action((options) => {
        let expenses = loadExpenses();

        

        if (!Array.isArray(expenses)) {
            console.error("Error: expenses is not an array!");
            return;
        }

        let expense = expenses.find(exp => exp.id === options.id);

        if (!expense) {
            console.error(` No expense with ID ${options.id} found`);
            return;
        }

        if (options.description) {
            expense.description = options.description;
        }
        if (options.amount) {
            if (options.amount < 0) {
                console.log("❌ Enter a positive amount");
                return;
            } else {
                expense.amount = options.amount;
            }
        }

        saveExpenses(expenses);
        console.log(`The expense with ID ${options.id} was updated`);
    });

        program
        .command("clear")
        .description("Deleted all the expenses")
        .action(()=>{
            saveExpenses([]);
            console.log("All the expenses are deleted successfully");
        });

        program
        .command("summary")
        .description("Summary of all the expenses")
        .action(()=>{
            const expenses = loadExpenses();

            let totalExpense=0;
            if(expenses.length===0){
                console.log("No Expenses found !");
            } else {
            for(let exp of expenses){
                totalExpense+= exp.amount;
            }
            console.log(`The total expenses are ${totalExpense}`);
        }
        });

    
   
    program.parse(process.argv);