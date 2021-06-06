import NewToDo from './createNewTodo'

const NewOption = (() => {
    const side_bar = document.getElementById('side-bar');

    const create_allProjectsContainers = () => { 
        const allProjectsContainers = document.createElement('div');
        allProjectsContainers.id = "all-projects";
        document.querySelector('body').appendChild(allProjectsContainers)
    }

    const create_form_layout = () => {    
        const menu_form = document.createElement('form');
        const form_label = document.createElement('label');
        form_label.innerText = "Category\n";

        const input_form = document.createElement('input');
        input_form.type = 'text';
        input_form.id = 'category-input';
        input_form.placeholder = "Enter a category"

        const addBtn = document.createElement('button');
        addBtn.textContent = "Add"
        addBtn.id = "add-button";
        addBtn.addEventListener('click',create_new_option);

        const categories_label = document.createElement('label');
        categories_label.for = "list";
        categories_label.innerText = "\n\nAll\n";

        const options_listBox = document.createElement('select');
        options_listBox.id = 'list';
        options_listBox.multiple = true;

        const removeBtn = document.createElement('button');
        removeBtn.id = "remove-button";
        removeBtn.textContent = "Remove"
        removeBtn.addEventListener('click', remove_selected_options);
        
        const homeBtn = document.createElement('button');
        homeBtn.setAttribute("id","home-btn")
        homeBtn.textContent = "Home Page";
        homeBtn.addEventListener('click', () => {
            const main = document.getElementById('main')
            main.style.display='block';
            hidePresentDiv("");
        })
       
        side_bar.appendChild(homeBtn)
        menu_form.appendChild(form_label);
        menu_form.appendChild(input_form);
        menu_form.appendChild(addBtn);
        menu_form.appendChild(categories_label);
        menu_form.appendChild(options_listBox);
        menu_form.appendChild(removeBtn);
               
        side_bar.appendChild(menu_form);
        
        const categories_list = document.createElement('ul');
        categories_list.id = 'categories-list';
        side_bar.appendChild(categories_list);
    }
 
    const create_new_option = (event) => {
        const entered_category = document.querySelector('#category-input');
        const options_box = document.querySelector('#list').options;
        const categories_menu = document.querySelector('#categories-list');
        // validate the option
        if ((entered_category.value == '') || (!isNaN(entered_category.value))) {
            alert('Please enter the name.');
            return;
        }
        // create a new option
        const new_option = new Option(entered_category.value, entered_category.value);
        
        // add it to the box
        options_box.add(new_option);

        // reset the value of the input
        entered_category.value = '';
        entered_category.focus();
        event.preventDefault();

        //add to categories menu below
        addToCategoriesList(categories_menu,new_option.value);
        
        //add to the array 
        CategoriesList.insert_category(new_option.value);
    }

    const remove_selected_options = (event) => {
        const options_box = document.querySelector('#list');
        const categories_menu = document.querySelector('#categories-list');

        //remove from the box
        const removed_index = options_box.selectedIndex;
        options_box.remove(removed_index);    
        event.preventDefault();
        // remove from categories menu
        categories_menu.removeChild(categories_menu.childNodes[removed_index]);
        //remove from array
        CategoriesList.remove_category(removed_index)
    }
    
    const addToCategoriesList = (main_list,addedCategory) => {
        const categoryContainer = document.createElement('li');
        categoryContainer.innerText = addedCategory;
        categoryContainer.className = 'added-category';
        categoryContainer.id = addedCategory;
        categoryContainer.addEventListener('click', () => {
            const categoryDivId = addedCategory + "-populate";
            const main = document.getElementById('main')
            main.style.display='none';
            configureEachCategoryViews(addedCategory,categoryDivId);
            hidePresentDiv(categoryDivId)            
        })
        main_list.appendChild(categoryContainer);

    }

    const hidePresentDiv= (categoryDivId) => {
        const allPresentDivs = document.querySelectorAll('.category-div');
            allPresentDivs.forEach((div) => {
                if (div.id != categoryDivId ) {
                    div.style.display = "none";
                } else {
                    div.style.display = "block";
                }
            })
    }
    
    const configureEachCategoryViews = (addedCategory,categoryDivId) => {
        const allProjectsContainers = document.getElementById('all-projects');      
        const existingDiv = document.querySelector(`#${categoryDivId}`);
        if (existingDiv) {
            const allps = existingDiv.querySelectorAll('p');
            allps.forEach((p) => p.remove())
            const new_div = CategoriesList.populateToDos(addedCategory,existingDiv);
            allProjectsContainers.appendChild(new_div) 

        } else {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category-div';
                categoryDiv.id = categoryDivId;
                const heading = document.createElement('h2');
                heading.textContent = addedCategory;
                categoryDiv.appendChild(heading)
                const new_categoryDiv = CategoriesList.populateToDos(addedCategory,categoryDiv);
                allProjectsContainers.appendChild(new_categoryDiv)
            }
        }
    
    return {create_form_layout,
        remove_selected_options,side_bar,
        create_new_option,
        addToCategoriesList,
        configureEachCategoryViews,
        create_allProjectsContainers
    };
})();


const CategoriesList = (() => {
    let categoriesList = [];
    const insert_category = (category) => {
        categoriesList.push(category);
        localStorage.setItem("CategoriesArrayStorage", JSON.stringify(categoriesList));
    }

    const remove_category = (categoryIndex) => {
        categoriesList.splice(categoryIndex,1);
        localStorage.setItem('CategoriesArrayStorage', JSON.stringify(categoriesList)); 
    }

    const addCheckBoxToCategory = (modalBox_id,parent_div) => {  
        categoriesList.forEach((category) => {
            const cat_element_id = category+ "-" + modalBox_id;
            const cat_element = NewToDo.create_div(category,'listed-category',cat_element_id);
            const checkBox = NewToDo.create_inputButton('checkbox',`checkbox-${category}`);
            const checkBoxId = "radio-"+cat_element_id;  
            checkBox.setAttribute("id",checkBoxId)
            const cat_element_p = document.createElement('p');
            cat_element_p.innerText = category;
            cat_element.appendChild(checkBox);
            cat_element.appendChild(cat_element_p);
            parent_div.appendChild(cat_element);

            checkBox.addEventListener('change', () => {
                updateItemCategory(modalBox_id,checkBox,cat_element_p)
            })
            ifCheckBoxIsChecked(checkBox,cat_element_p.innerText,modalBox_id)

        })  
        return parent_div;    
    } 
    
    const ifCheckBoxIsChecked = (checkBox,checkBoxText,modalBox_id) => {
        NewToDo.getTodos().map((item) => {
            if (modalBox_id.includes(item.id)) {
                checkBox.checked = item.category == checkBoxText;            
            }})
    }

    const updateItemCategory = (modalBox_id,checkBox,cat_element_p) => {
        NewToDo.getTodos().map((item) => {
            if (modalBox_id.includes(item.id)) {
                if (checkBox.checked) {
                    item.category = cat_element_p.innerText;
                } else {
                    item.category = "";
                }
            }
        })

        NewToDo.persistToStorage();
    }

   
                
    const populateToDos = (category,master_div) => {
        const newtodos = NewToDo.getTodos();
        newtodos.map((item) => {
            if (item.category == category) {
                const categoryTodo = document.createElement('p');
                categoryTodo.setAttribute("class","category-note");
                const categoryTime = document.createElement('p');
                categoryTime.setAttribute("class","category-time");
                categoryTodo.innerText = item.note;
                categoryTime.innerText = item.date;
                master_div.appendChild(categoryTodo)
                master_div.appendChild(categoryTime)
            }
        })
        return master_div;
    }

    const populateViews = () => {
        const options_box = document.querySelector('#list');
        const categories_menu = document.querySelector('#categories-list');
        categoriesList.forEach((category) => {
            const addedOption = new Option(category,category);
            options_box.options.add(addedOption);
            NewOption.addToCategoriesList(categories_menu,category);    
            })
        }                 
   

    const loadFromStorage = () => {    
        let categoriesArrayFromStorage = JSON.parse(localStorage.getItem("CategoriesArrayStorage"));
        if ((categoriesArrayFromStorage !== null)){
            categoriesList = categoriesArrayFromStorage;
            console.log(categoriesList)
        } else {
            categoriesList = [];
       
        }
        
    }
    
    return {
        insert_category,
        addCheckBoxToCategory,
        remove_category,
        populateToDos,
        categoriesList,
        loadFromStorage,
        populateViews,
        ifCheckBoxIsChecked,
        
    }
})();

export {NewOption, CategoriesList}