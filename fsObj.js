var readlineSync = require('readline-sync');
var prompt = require('prompt-sync')();
var exit = false;
var fs = require('fs');
var path = require('path');
var menu = [
    'Print current folder',
    'Change current folder',
    'Create file or folder',
    'Delete file or folder',
    'Search in file or folder',
    'Quit Program',
    'Save Flat Array',
    'Load None Flat Array'
];

/* this will be the storage for our file system */
var fsStorage = [
    {
        id: 0,
        name: 'root',
        children: [{
            id: 1,
            name: 'sub1',
            children: [
                {id: 4, name: 'file1.txt', type: 'file'},
                {
                    id: 5, name: 'wow', children: [
                    {id: 6, name: 'asaf', children: [], type: 'directory'}
                ], type: 'directory'
                }
            ],
            type: 'directory'
        },
            {id: 2, name: 'sub2', children: [], type: 'directory'},
            {id: 3, name: 'file2.txt', content: 'text', type: 'file'}
        ],

        type: 'directory'
    }
];

var folderStack = [];
var currentFolderId = 0;
var root = fsStorage[0];
var currentFolder = 0;


function printChildren(id, file) {
    var result = undefined;
    if (file.id == id) {
        return file;
    }
    for (var i = 0; i < file.children.length; ++i) {
        if (file.children[i].id === id) {
            return file.children[i];
        } else {
            if (file.children[i].type === 'directory') {
                result = printChildren(id, file.children[i]);
                if (result !== undefined) {
                    return result;
                }

            }
        }
    }

}

function printParent(currentObjId, file) {
    var result = undefined;
    for (var i = 0; i < file.children.length; ++i) {
        if (currentObjId === file.children[i].id) {
            return file;
        } else {
            if (file.children[i].type === 'directory') {
                result = printParent(currentObjId, file.children[i]);
                if (result !== undefined) {
                    return result;
                }
            }
        }

    }
}

function findAllIds(array, file) {

    for (var i = 0; file.children[i]; ++i) {
        if (file.children[i].type === 'directory') {
            array.push(file.children[i].id);
            findAllIds(array, file.children[i])
        }
        if (file.children[i].type === 'file') {
            array.push(file.children[i].id)
        }

    }


}

function createArray(newArray, oldArray) {
    for (var i = 0; i < oldArray.length; ++i) {
        if (oldArray[i].id == currentFolder) {
            newArray.push({
                id: oldArray[i].id,
                name: oldArray[i].name,
                type: oldArray[i].type,
                parent: null
            });
        }
        else if (oldArray[i].type === 'directory') {
            newArray.push({
                id: oldArray[i].id,
                name: oldArray[i].name,
                type: oldArray[i].type,
                parent: currentFolder
            });
        }
        else if (oldArray[i].type === 'file') {
            newArray.push({
                id: oldArray[i].id,
                name: oldArray[i].name,
                type: oldArray[i].type,
                content: "text",
                parent: currentFolder
            });
        }


        if (oldArray[i].type === 'directory') {
            folderStack.push(currentFolder);
            currentFolder = oldArray[i].id;
            createArray(newArray, oldArray[i].children);
            currentFolder = folderStack.pop();
        }
    }
}


function reverseArray(flatArray, file) {
    for (var i = 0; i < flatArray.length; ++i) {
        if (flatArray[i].parent === file.id && flatArray[i].type === 'directory') {
            file.children.push({
                id: flatArray[i].id,
                name: flatArray[i].name,
                children: [],
                type: flatArray[i].type
            })
        }
        else if (flatArray[i].parent === file.id && flatArray[i].type === 'file') {
            file.children.push({
                id: flatArray[i].id,
                name: flatArray[i].name,
                content: 'text',
                type: flatArray[i].type
            })
        }

    }

    var fileChildren = file.children;

    revereseArrayChildren(flatArray, fileChildren)
}

function revereseArrayChildren(flatArray, fileChildren) {
    for (var i = 0; i < fileChildren.length; ++i) {

        for (var j = 0; j < flatArray.length; ++j) {
            if (flatArray[j].parent === fileChildren[i].id && flatArray[j].type === 'directory') {
                fileChildren[i].children.push({
                    id: flatArray[j].id,
                    name: flatArray[j].name,
                    children: [],
                    type: flatArray[j].type
                });
                revereseArrayChildren(flatArray, fileChildren[i].children)

            }
            else if (flatArray[j].parent === fileChildren[i].id && flatArray[j].type === 'file') {
                fileChildren[i].children.push({
                    id: flatArray[j].id,
                    name: flatArray[j].name,
                    content: "text",
                    type: flatArray[j].type
                })
            }

        }
    }

}

function checkIfArrayIsUnique(myArray)
{
    for (var i = 0; i < myArray.length; i++)
    {
        for (var j = 0; j < myArray.length; j++)
        {
            if (i != j)
            {
                if (myArray[i].id === myArray[j].id)
                {
                    return true;
                }
            }
        }
    }
    return false;
}

function checkIfFileDamagedId(arr){
    var flag = false;
    for(var i = 0; i < arr.length; ++i){
        if(isNaN(arr[i].id) || arr[i].id === null || arr[i].id === "" || arr[i].id === " " || arr[i].id === undefined){
            flag = true;
        }


    }
    return flag;
}

function checkIfFileDamagedType(arr){
    var flag = false;
    for(var i = 0; i < arr.length; ++i){
        if(arr[i].type === "directory" || arr[i].type === "file"){
            flag = false;
        } else {
            flag = true;
            break;
        }

    }
    return flag;
}

function checkIfFileDamagedParent(arr){
    var flag = false;
    if(arr[0].id === 0 && arr[0].parent === null){
        for(var i = 1; i < arr.length; ++i){
            if((arr[i].parent >= arr[i].id) || isNaN(arr[i].parent) || arr[i].parent === " " || arr[i].parent === "" ||
                arr[i].parent === null){
                flag = true;

                break;
            }
        }
    } else {
        flag = true;

    }
    return flag
}




main();

function main() {
    while (!exit) {
        printMenu();
    }
    process.exit(0);
}

function printMenu() {
    var answer = readlineSync.keyInSelect(menu, 'Please make your choice:');
    switch (answer) {
        case 0:
            printCurrentFolder();
            break;
        case 1:
            changeCurrentFolder();
            break;
        case 2:
            createFileOrFolder();
            break;
        case 3:
            deleteFileOrFolder();
            break;
        case 4:
            searchInFileOrFolder();
            break;
        case 5:
            quitProgram();
            break;
        case 6:
            saveArray();
            break;
        case 7:
            loadArray();
            break;
    }
}

function printCurrentFolder() {
    var targetItem;
    console.log('printing current folder');

    targetItem = printChildren(currentFolderId, root);

    console.log("--" + targetItem.name + " " + "<" + targetItem.type + ">");
    for (i = 0; i < targetItem.children.length; ++i) {
        console.log("---------" + targetItem.children[i].name + " " + "<" + targetItem.children[i].type + ">")
    }


}

function changeCurrentFolder() {
    var notFound = true;
    var currentObj = printChildren(currentFolderId, root);
    var fwrOrBck = prompt("move forward (..) or backward (cd/)");

    if (fwrOrBck === "..") {
        var answer = prompt("move to folder: ");
        for (var i = 0; i < currentObj.children.length; ++i) {
            if (currentObj.children[i].name === answer && currentObj.children[i].type === 'directory') {
                currentFolderId = currentObj.children[i].id;
                notFound = false;

            }
        }
        if (notFound === true) {
            console.log("---Directory not found---")
        }

    }
    else if (fwrOrBck === "cd/") {
        if (currentFolderId > 0) {
            var parent = printParent(currentFolderId, root);
            currentFolderId = parent.id;
        } else {
            currentFolderId = root.id;
            console.log("---You are in Root---")
        }
    }


}

function createFileOrFolder() {
    var DirToCreateIn = printChildren(currentFolderId,root);
    var idsArray = [0];
    findAllIds(idsArray,root);
    var sortedArray = idsArray.sort();
    var alreadyExists = false;



    var fileOrFolder = prompt("what do you want to create?(file or folder)");

    if(fileOrFolder === 'folder'){
        var foldername = prompt("what is the folder name?");

        for(var i = 0; i < DirToCreateIn.children.length; ++i){
            if(DirToCreateIn.children[i].name === foldername){
                alreadyExists = true;
                break;
            } else {
                alreadyExists = false;
            }
        }



        if(alreadyExists === false){
            var createdFolder = {id: sortedArray[sortedArray.length-1]+1,
                name: foldername,
                children: [],
                type: 'directory'
            };

            DirToCreateIn.children.push(createdFolder);
        } else {
            console.log("---ALREADY EXISTS---")
        }



    }

    if(fileOrFolder === 'file'){
        var filename = prompt("what is the file name?");

        for(var i = 0; i < DirToCreateIn.children.length; ++i){
            if(DirToCreateIn.children[i].name === filename){
                alreadyExists = true;
                break;
            } else {
                alreadyExists = false;
            }
        }

        if(alreadyExists === false){
            var createdFile = {id: sortedArray[sortedArray.length-1]+1,
                name: filename,
                content:'text',
                type: 'file'};

            DirToCreateIn.children.push(createdFile);} else {
            console.log("---ALREADY EXISTS---");
        }
    }




}

function deleteFileOrFolder() {
var currentObj = printChildren(currentFolderId, root);
var childrenArray = currentObj.children;
var childExists = false;
var answer = prompt("What File or Directory would you like to delete?: ")

    for(var i = 0; i < childrenArray.length; ++i){
        if(childrenArray[i].name === answer){
            childrenArray.splice(childrenArray.indexOf(childrenArray[i]),1)
            childExists = true;
        }


    }

    if(childExists == false){
        console.log("---Name is not Exists---")
    }


};


function searchInFileOrFolder() {

};

function quitProgram() {
    var answer = readlineSync.keyInYNStrict('Are you sure?');
    exit = answer ? true : false;
};


function saveArray() {
    var fsFlatArray = [];
    var answer = prompt("choose a name for your saved txt file: ") + ".txt";

    createArray(fsFlatArray, fsStorage);
    fs.writeFileSync(__dirname + "/" + answer, JSON.stringify(fsFlatArray));

};

function loadArray() {
    var answer = prompt("what file do you want to load?: ") + ".txt";
    var currentObj = printChildren(currentFolderId, root);
    if(currentObj.id === 0){
    try {
        var flattenArray = fs.readFileSync(__dirname + "/" + answer).toString();
        if(flattenArray !== ""){
        flattenArray = JSON.parse(flattenArray);

        if(checkIfArrayIsUnique(flattenArray) == false){

            if(checkIfFileDamagedId(flattenArray) ==  false){
               if(checkIfFileDamagedType(flattenArray) == false) {
                   if(checkIfFileDamagedParent(flattenArray) == false) {
                       var rootManualBuild = {id: 0, name: 'root', children: [], type: 'directory'};
                       var finalArray = [];


                       reverseArray(flattenArray, rootManualBuild);
                       finalArray.push(rootManualBuild);
                       fsStorage = finalArray;
                       root = fsStorage[0];
                   } else {
                       console.log("---File is Corrupt Parent---")
                   }} else {
                   console.log("---File is Corrupt Type---")
               }} else {
                console.log("---File is Corrupt Id---")
            }

        } else {
            console.log("---File has Duplicate Ids---")
                   }
        } else {
            console.log("---File is Empty---")
        }}
    catch (e) {
        console.log(e.message);
        printMenu()
    }
    } else {
        console.log("In order to load new File System please return to root folder.")
    }


};


