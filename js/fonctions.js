// Valeur totale que coûte le site
var totalValeur = 0
// un tableau qui contient les ids des questions pour nous sérvir en cas de retour en arrière 
var lesIdsQuestions = []
// contient prix description et serviceMinimum par rapport à une réponse donnée par utilisateur
var ligneObjet = {}
// ce tableau contient l'objet ligneObjet
var recaps = []
// budget saisi par l'utilisateur
var valeurBudgetClient = 0

const quizz = document.querySelector("#quizz")



// La fonction afficherLaQuestion prend en paramétre idQuestion
function afficherLaQuestion (idQuestion, boutonRetourClique = false) {

    let urlCallQuestion = "https://api.airtable.com/v0/appDy1ud9kdkbSAOb/Questions/"+ idQuestion +"?api_key=keyxEX6nxNX72eMkB"
    $.ajax({
        url: urlCallQuestion,
        dataType: 'json',

        success: function(apiResponse) {

            //boutonRetourCliqué s'agit de boutonRetour pour chaque question par defaut il est à false
            if(boutonRetourClique == false){
                lesIdsQuestions.push(idQuestion)
            }else{
                lesIdsQuestions.pop(idQuestion)
                recaps.pop()
                boutonRetourClique = false
            }
            // on affiche le bouton retour après avoir afficher la première question
            if(apiResponse.fields.isPremiere !== 1)
            {
                idQuestionPrecedente = lesIdsQuestions[lesIdsQuestions.length - 2]
                if(typeof idQuestionPrecedente !== 'undefined')
                {
                    let boutonRetour = 
                    "<button class='uk-button-danger uk-button-small' id='bouton-retour'  onclick='afficherLaQuestion(idQuestionPrecedente, true)'>Retour</button>" 
                    $("#affiche-bouton-retour").html(boutonRetour)
                }
            }

           
            $(".contenuQuizz").hide()
            $(".affichage-devis").hide()
             //On affiche la question
            if (typeof apiResponse.fields.txtQuestion !== 'undefined' && typeof apiResponse.fields.complement !== 'undefined') 
            {
                let questionTexte =
                    "<h2>" + apiResponse.fields.txtQuestion + "</h2>" +
                    "<h4>" + apiResponse.fields.complement + "</h4>"

                $("#affichage-question").html(questionTexte)
            } else if (typeof apiResponse.fields.complement == 'undefined')
            {
                questionTexte =
                    "<h2>" + apiResponse.fields.txtQuestion + "</h2>" 

                $("#affichage-question").html(questionTexte)
            } 

            $.ajax({
                url: 'https://api.airtable.com/v0/appDy1ud9kdkbSAOb/Reponses?filterByFormula=recordIdQuestionOrigine%20%3D%20%27'+ idQuestion +'%27&api_key=keyxEX6nxNX72eMkB',

                dataType: 'json',
                success: function(apiResponse) {
                    $("#affichage-reponse").html("")

                    //On crée les boutons oui ou non ou ... pour chaque réponse
                    //on injecte l'id de question suivante dans data-qst-suiv
                    //on injecte l'id de la réponse  dans data-id-reponse
                    apiResponse.records.forEach(reponse => {

                        let reponseBouton = ""

                        let attributBoutonReponse = ""
                        //Si la question suivante et la réponse sont définis 
                        if (typeof reponse.fields.txtReponse !== 'undefined' && typeof reponse.fields.questionSuivante !== 'undefined') 
                        {
                            attributBoutonReponse =  "data-qst-suiv='" + reponse.fields.questionSuivante[0] + "'"

                        // si l'id question suivante n'est pas définie
                        }else if(typeof reponse.fields.questionSuivante == 'undefined'){}
                        reponseBouton =
                            "<button class='uk-button-primary uk-button-small  boutonReponse'  onclick='changeColor();' "+ attributBoutonReponse +"  data-id-reponse='" + reponse.id + "'>" + reponse.fields.txtReponse + "</button>" 
                            $("#affichage-reponse").append(reponseBouton)

                    })

                    $(".contenuQuizz").fadeIn(700)
                    
                    //On récupère les dataset de questionSuivante et dataset de l'id de réponse 
                    //on passe l'id de la réponse dans la requette pour récupérer les infos 
                    //correspandant à cett id
                    let lesBoutons = document.querySelectorAll(".boutonReponse")
                    lesBoutons.forEach( el => {
                        $("#quizz").removeClass('uk-animation-fade')
                        $("#quizz").removeClass('uk-animation-reverse')
                        el.addEventListener('click', (boutonClique) => {
                            
                            $("#quizz").addClass('uk-animation-fade')
                            $("#quizz").addClass('uk-animation-reverse')

                            var questionSuivante = boutonClique.target.dataset.qstSuiv
                            var theReponseId = boutonClique.target.dataset.idReponse
                            
                            $.ajax({
                                url: "https://api.airtable.com/v0/appDy1ud9kdkbSAOb/Reponses/"+ theReponseId +"?api_key=keyxEX6nxNX72eMkB",
                                contentType : 'application/json',
                                dataType : 'json',
                                success: function(apiResponse) {
                                    //contient le prix donné à cette réponse
                                    let laValeurReponse = apiResponse.fields.valeur
                                    //contient la serviceminimale
                                    let serviceMinimum = apiResponse.fields.ligneServiceMinimum
                                    //contient la description de la réponse
                                    let descriptionLigneDevis = apiResponse.fields.descriptionLigneDevis

                                    let messagePreRempli = apiResponse.fields.messagePreRempli


                                    ligneObjet = {"prix": laValeurReponse, "description": descriptionLigneDevis, "serviceMinimum": serviceMinimum, "messagePreRempli": messagePreRempli}
                                    recaps.push(ligneObjet)
                                    
                                    $(".contenuQuizz").html("")
                                    if(questionSuivante)
                                    {
                                        afficherLaQuestion(questionSuivante, false)
                                    }else
                                    {
                                        afficherPageBudget()
                                    }
                                    
                                }
                            })
                        })
                    })
                }
            });
        }
    });
}


//fonction imprime imprime la page de récapitulatif
function imprime(){
    window.print()
}

//cette fonction déclance l'affichage de quiz
function displayQuizz(){

    $.ajax({
        url: "https://api.airtable.com/v0/appDy1ud9kdkbSAOb/Questions?api_key=keyxEX6nxNX72eMkB",
        dataType: 'json',
        success: function(apiResponse) {
            apiResponse.records.forEach(reponse => {

                if(reponse.fields.isPremiere === 1){
                    afficherLaQuestion(reponse.id, false)
                    changeColor()
                }
            })
        }
    })
    const startQuizz = document.querySelector("#startQuizz")
    startQuizz.innerHTML = ""
}


//fonction pour afficher le devis
function afficherLeDevis(){

    $("#budget-client").html("")
    $("#quizz").removeClass('uk-animation-fade')
    $("#quizz").removeClass('uk-animation-reverse')
    const recap = document.querySelector("#recap")
    const estimation = document.querySelector("#estimation")
    const boutonRetour = document.querySelector("#affiche-bouton-retour")
    const boutonImprimer = document.querySelector("#boutonImprimer")
    const boutonContact = document.querySelector("#boutonContactezMoi")
    const budgetSaisi = document.querySelector("#budgetSaisi")
    const recapBudgetClient = document.querySelector("#recapBudgetClient")


    // on calcule le totalValeur
    recaps.forEach(record => {
        if(typeof record.prix !== 'undefined'){
            totalValeur += record.prix
        }
            
    })

    //la marge
    let valeurMarge = totalValeur - 800

    //on compte 200€ en dessous de la marge
    let valeurAffichageServiceMinimum = valeurMarge - 200 




    //Données à transmettre sur l'ensemble des choix faits par l'utilisateur(service maximum airtable)
    let tableRecaps = ""
    let sommeTotale = 0
    let message = ""
    recaps.forEach(recap => {
        if(typeof  recap.messagePreRempli !== "undefined"){
            message += `Remarque : ${recap.messagePreRempli}\n`
        }else{
            message += ""
        }
        if(typeof recap.description !== 'undefined' && typeof recap.prix !== 'undefined'){
            tableRecaps += `${recap.description} ${recap.prix} €\n`
            sommeTotale += recap.prix
                        
        }else if(typeof recap.description == 'undefined' && recap.prix == 0){
            tableRecaps += ""
        }

    })
    tableRecaps += `Total : ${sommeTotale}\n`
    tableRecaps += `${message}`




    //Données à transmettre à airtable sur les choix faits par l'utilisateur avec un budget pas souffisant
    let tableRecapsServiceMinimum = ""
    //service minimum
    if(valeurBudgetClient < valeurAffichageServiceMinimum){
        budgetSaisi.innerHTML = "Votre budget est de  "+ valeurBudgetClient +" €"
        recapBudgetClient.innerHTML = createTableRecapitulatifServiceMinimum()


        let prixServiceMinimumCumule = 0
        let budgetClient = valeurBudgetClient
        let somme = 0
        //on remplit le service minimum pour le URL airtable
        recaps.forEach(recap => {

            if(typeof recap.description !== 'undefined' && typeof recap.prix !== 'undefined'){

                prixServiceMinimumCumule += recap.prix

                if(prixServiceMinimumCumule > budgetClient) return

                tableRecapsServiceMinimum += `${recap.description} ${recap.prix} €\n`
                somme += recap.prix
                            
            }else if(typeof recap.description == 'undefined' && recap.prix == 0){
                tableRecapsServiceMinimum += ""
            }
            
        })
        tableRecapsServiceMinimum += `Total : ${somme} €\n`
    //service complet
    }else if(valeurBudgetClient >= totalValeur){
        budgetSaisi.innerHTML = "Votre budget de  "+ valeurBudgetClient +" €"
        
    }


    let uri = "Votre budget "+ valeurBudgetClient +" € :\n"+ tableRecapsServiceMinimum +"\nTable récapitulatif : \n"+ tableRecaps +""
    let uriEncodee = encodeURI(uri)



    estimation.innerHTML = "<h3>L'estimation de prix de votre site s'élève entre "+ valeurMarge +"€ et "+ totalValeur +"€</h3>"
    
    boutonRetour.innerHTML = ""
    boutonImprimer.innerHTML = `<button type='submit' class='uk-button-primary uk-button-small' onclick='imprime()'>
                                    Imprimer
                                </button>`
    boutonContact.innerHTML = `<a class='uk-button-primary uk-button-small' href='https://airtable.com/shrtvWMYReFks6tMo?prefill_resumeDevis=${uriEncodee}'>
                                    Contactez Moi
                                </a>`
    recap.innerHTML = createTableRecapitulatif()
    $(".affichage-devis").fadeIn(1200)


}

//affichage de la page pour demander le budget client
function afficherPageBudget(){
    const budgetClient = document.querySelector("#budget-client")
    budgetClient.innerHTML = `<h3>Veuillez indiquer votre budget </h3>
                                <form class='uk-form'>
                                <label class='uk-label'>
                                    Votre Budget
                                    <input id='valeurIndique' type='number' class='uk-input uk-form-width-medium' placeholder='votre budget' required>
                                </label>
                                <input class='uk-input uk-form-success uk-form-width-medium' id='boutonValider' type='submit' value='Valider'>
                                </form>`

    const boutonValider = document.querySelector("#boutonValider")
    boutonValider.addEventListener('click', (e)=> {
        e.preventDefault()
        valeurBudgetClient = document.querySelector('#valeurIndique').value

        if(typeof valeurBudgetClient !== 'undefind')
        afficherLeDevis()
    })
}


// on crée la table de récapitulatif
function createTableRecapitulatif() {
    let somme = 0
    let tableString = `<table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Prix Max</th>
                            </tr>
                        </thead>
                        <tbody>`
        recaps.forEach(recap => {
            if(typeof recap.description !== 'undefined' && typeof recap.prix !== 'undefined'){
            tableString += `<tr>
                                <td>${recap.description}</td>
                                <td>${recap.prix} €</td>
                            </tr>`
                            somme += recap.prix 
            }else if(typeof recap.description == 'undefined' && recap.prix == 0){
                tableString += ""
            }
        })
        tableString += `<tr>
                            <td>Total</td>
                            <td>${somme} €</td>
                        </tr>`
        
    tableString += "</tbody></table>"                  
    return tableString
}

// on crée la table de récapitulatifServiceMinimum car le budget n'est pas souffisant
function createTableRecapitulatifServiceMinimum() {
    let somme = 0
    let prixServiceMinimumCumule = 0
    let budgetClient = valeurBudgetClient

    let tableString = `<table>
                        <thead>
                            <tr>
                                <th>Description de service</th>
                                <th>Prix Max</th>
                            </tr>
                        </thead>
                        <tbody>`
        recaps.forEach(recap => {
            if(typeof recap.serviceMinimum !== 'undefined' && typeof recap.prix !== 'undefined'){
                prixServiceMinimumCumule += recap.prix
                if(prixServiceMinimumCumule > budgetClient) return
                    
                tableString += `<tr>
                                    <td>${recap.serviceMinimum}</td>
                                    <td>${recap.prix} €</td>
                                </tr>`
                somme += recap.prix
            }else if(typeof recap.description == 'undefined' && recap.prix == 0){
                tableString += ""
            }
        })
        tableString += `<tr>
                            <td>Total</td>
                            <td>${somme} €</td>
                        </tr>`
        
    tableString += "</tbody></table>"                  
    return tableString
}



//changement de couleur de body à chaque changement de question
let colors = ["#A3E4DB", "#F4EEA9", "#F5EEDC", "#FED2AA", "#E6E6E6", "#FFEDD3"];
let colorIndex = 0;
function changeColor() {

    let col = document.getElementById("body");
    if( colorIndex >= colors.length ) {
        colorIndex = 0;
    }
    col.style.backgroundColor = colors[colorIndex];
    colorIndex++;
}

