#! /usr/bin/env node

const path = require('path');
const inquirer = require('inquirer');
const fs = require("fs");
const uuid = require("uuid");
const { exec } = require('child_process');

const templateRepo = "https://github.com/SwiftTechApp/swift-hotswap-module-template.git";

console.clear();
console.log("Swift AIO Module Creator\n")

var configGen = {}

function basename(pathName) {
    const res = path.basename(path.resolve(pathName));
    return res;
}

var defaultmodName = basename('.').toLowerCase().split(" ").join("-");
var defaultmodID = "my-module";

inquirer
  .prompt([
    {
        name: "mName",
        message: "Module name (" + defaultmodName + ")"
    },
    {
        name: "mDesc",
        message: "Description"
    },
    {
        name: "mAuthor",
        message: "Author (" + require("os").userInfo().username + ")"
    },
    {
        type:'checkbox',
        message: "Module Permissions",
        name: 'mPerms',
        choices: [
            {
                value: "walletAccess",
                name: "Wallet Access\n   Access the user's wallets including private keys (Source Verification Required)"
            },
            {
                value: "interceptETHMint",
                name: "Intercept ETH Mint\n   Intercept a request to mint an Ethereum NFT and modify it (Source Verification Required)"
            },
            {
                value: "interceptSOLMint",
                name: "Intercept SOL Mint\n   Intercept a request to mint a Solana NFT and modify it (Source Verification Required)"
            },
            {
                value: "interceptETHSnipe",
                name: "Intercept ETH Snipe\n   Intercept a request to snipe an Ethereum NFT and modify it, this applies for all sites (Source Verification Required)"
            },
            {
                value: "applicationDesign",
                name: "Application Design\n   Inject custom global CSS to change the design of Swift AIO"
            },
            {
                value: "customPages",
                name: "Custom Page\n   Inject custom code to add pages to the Swift AIO app"
            },
        ]
    }
  ])
  .then((a) => {
    console.clear();
    var definedModID = a["mName"];
    var desc = a["mDesc"];
    var author = a["mAuthor"];
    var definedModName = a["mName"];

    if (author !== undefined && author.split(" ").join("") === "")
        author = require("os").userInfo().username;
    
    if (author === undefined)
        author = require("os").userInfo().username;
    
    if (definedModName !== undefined && definedModName.split(" ").join("") === "")
        definedModName = defaultmodName

    if (definedModID !== undefined && definedModID.split(" ").join("") === "")
        definedModID = undefined;
    else if (definedModID !== undefined)
        definedModID = definedModID.toLowerCase().split(" ").join("-");
    
    if (definedModID !== undefined && definedModID.endsWith("-"))
        definedModID = definedModID.substring(0, definedModID.length - 1)

    if (definedModID === undefined)
        definedModID = defaultmodID
    
    configGen.name = definedModName;
    configGen.id = uuid.v4();
    configGen.description = desc;
    configGen.author = author;
    configGen.permissions = a["mPerms"];

    console.log("Generating module template...")
    try {
        fs.rm(definedModID, { recursive: true, force: true }, () => {
            exec(`git clone ${templateRepo} ${definedModID}`, (err, stdout, stderr) => {
                if (err) {
                  console.error("Failed to clone template repo, make sure git is installed on your system");
                  console.error("Error:\n", err);
                  return;
                }
                
                console.log("Writing module config")
                fs.writeFileSync(definedModID + "/config.json", JSON.stringify(configGen, undefined, 4));
                console.log("Installing packages in module")
                process.chdir(definedModID);
                exec(`npm install`, () => {
                    console.clear()
                    console.log(`${definedModName} (/${definedModID}) module has been created.\n\nNext steps:\n - cd ${definedModID}\n - code .\n\nUse the provided "index.js" file to code your module!`)
                })
            });
        })
    } catch {
        console.error("Failed to prepare target directory")
    }
  })
  .catch((error) => {
    if (error.isTtyError) {
        console.log("Failed to render questions, error:", error)
    } else {
      console.log("Failed to load questions, error:", error)
    }
  });