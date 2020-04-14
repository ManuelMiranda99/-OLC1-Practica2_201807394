import { Component, OnInit } from '@angular/core';
import { Token } from 'src/app/Classes/Token';
import { LexicalAnalyzer } from 'src/app/Classes/lexicalAnalyzer';
import { Tab } from 'src/app/Classes/Tab';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms'
import { SyntacticAnalyzer } from 'src/app/Classes/syntacticAnalizer';
import { Errors } from 'src/app/Classes/Errors';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {

  tokenList = new Array<Token>();
  htmlTAGs = new Array<Token>();
  analyzer = new LexicalAnalyzer();
  parser = new SyntacticAnalyzer();
  sintacticErrors = new Array<Errors>();
  GeneralErrors = new Array<Errors>();
  showF = false;
  save = false;
  bErrors = false;
  alert = false;
  fileNameSave = "DocumentoCS";
  actualTab: Tab = new Tab("", "", "");
  public static countOfTabs = 0;

  tabs = new Array<Tab>();

  constructor() {}

  ngOnInit(): void {
    document.getElementById('mi-file').addEventListener('change', this.openFile, false);
  }

  analizeText(Form: NgForm, actualTab: Tab){

    let text = Form.value.text;    

    this.GeneralErrors = [];

    this.tokenList = this.analyzer.scanText(text);

    let flag = false;
    for(let token of this.tokenList){
      if(token.type === "UNKNOWN"){
        flag = true;
        break;
      }
    }    

    this.sintacticErrors = this.parser.Start(this.tokenList);

    if(flag){
      let x=1;
      // Lexical errors
      for(let error of this.tokenList){
        if(error.type === "UNKNOWN"){
          this.GeneralErrors.push(new Errors("Lexico", x, "Caracter no aceptado " + error.lexeme, error.row, error.column));
          x++;
        }
      }

      if(this.sintacticErrors.length > 0){
        // Sintactical Errors
        for(let error of this.sintacticErrors){
          error.id = x;
          this.GeneralErrors.push(error);
          x++;
        }
      }

      this.bErrors = true;
    }
    else{
      if(this.sintacticErrors.length > 0){
        let x=1;
        // Sintactical Errors
        for(let error of this.sintacticErrors){
          error.id = x;
          this.GeneralErrors.push(error);
          x++;
        }
        this.bErrors = true;
      }
    }        

    if(!flag && this.sintacticErrors.length === 0){
      actualTab.pythonText = this.parser.traductor.text;

      // HTML ANALIZE
      for(let html of this.parser.htmlList){
        this.htmlTAGs = this.analyzer.scanHTML(html);

        let flagHTML = false;
        for(let tag of this.htmlTAGs){
          if(tag.type === "BAD_TAG"){            
            flagHTML = true;
            break;
          }
        }

        if(flagHTML){
          actualTab.htmlText = "EXISTEN ERRORES EN EL HTML";
          actualTab.jsonText = "NO SE PUEDE REALIZAR LA CONVERSION A JSON";
          break;
        }
        else{
          this.parser.StartHTML(this.htmlTAGs);
          actualTab.jsonText += "\n" + 
          this.parser.jsonText;
          
          actualTab.htmlText += "\n" + this.parser.htmlText;
        }

      }      

    }

  }

  // Adding tabs to the screen
  addTab(){
    this.tabs.push(new Tab("TabNo" + MainComponent.countOfTabs, "Nuevo" + MainComponent.countOfTabs, ""));
    this.fileNameSave = "Nuevo" + MainComponent.countOfTabs;
    MainComponent.countOfTabs++;
  }
  
  /* --------------- Open a File --------------- */
  fileName: string = "";
  public static newTab: Tab = new Tab("", "", "");
  openFile(_evt){
    this.fileName = _evt.target.files[0].name;
    
    let file = _evt.target.files[0];
    if(!file){
      return;
    }

    MainComponent.newTab = new Tab("TabNo" + MainComponent.countOfTabs, this.fileName, "");
    MainComponent.countOfTabs++;

    let reader = new FileReader();    
    reader.onload = function(){
      let text = reader.result;
      //console.log(text);
      MainComponent.newTab.text = text.toString();
    };
    reader.readAsText(file);
    
  }

  useOpenFile(){
    this.showF = true;  
  }

  endOpenFile(){
    let newnewTab = new Tab(MainComponent.newTab.id, MainComponent.newTab.name, MainComponent.newTab.text);
    this.tabs.push(newnewTab);
    this.showF = false;
    this.fileNameSave = newnewTab.name;
  }

  /* --------------- Set actual tab for the save and save as function --------------- */
  setActualText(_tab: Tab){
    this.actualTab = _tab;
  }

  /* --------------- Save files --------------- */
  saveF(){
    if(this.tabs.length > 0 ){
      this.saveFile();
    }    
  }

  saveFA(){
    if(this.tabs.length > 0 ){
      this.save = true;
    }        
  }

  saveFile(){
    let textFileBlob = new Blob([this.actualTab.text], {type: 'text/plain'});    

    let downloadLink = document.createElement("a");

    this.fileNameSave = this.fileNameSave.replace(".cs", "");

    downloadLink.download = this.fileNameSave + ".cs";

    this.actualTab.name = this.fileNameSave;

    downloadLink.innerHTML = "GG?";

    window.URL = window.URL || window.webkitURL;

    downloadLink.href = window.URL.createObjectURL(textFileBlob);

    downloadLink.style.display = "none";

    document.body.appendChild(downloadLink);

    downloadLink.click();
    
    this.save = false;
  }

  /* --------------- Generate Reports --------------- */
  GenerateHTMLReport(){
    if(this.actualTab.htmlText.length > 0){
      let textFileBlob = new Blob([this.actualTab.htmlText], {type: 'text/plain'});    

      let downloadLink = document.createElement("a");

      this.fileNameSave = this.fileNameSave.replace(".cs", "");

      downloadLink.download = this.fileNameSave + ".html";

      this.actualTab.name = this.fileNameSave;

      downloadLink.innerHTML = "GG?";

      window.URL = window.URL || window.webkitURL;

      downloadLink.href = window.URL.createObjectURL(textFileBlob);

      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);

      downloadLink.click();
    }
    else{
      this.alert = true;
    }
  }

  GeneratePythonReport(){
    if(this.actualTab.pythonText.length > 0){
      let textFileBlob = new Blob([this.actualTab.pythonText], {type: 'text/plain'});    

      let downloadLink = document.createElement("a");

      this.fileNameSave = this.fileNameSave.replace(".cs", "");

      downloadLink.download = this.fileNameSave + ".py";

      this.actualTab.name = this.fileNameSave;

      downloadLink.innerHTML = "GG?";

      window.URL = window.URL || window.webkitURL;

      downloadLink.href = window.URL.createObjectURL(textFileBlob);

      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);

      downloadLink.click();
    }        
    else{
      this.alert = true;
    }
  }

  /* --------------- Return to editor --------------- */
  checkErrors(){
    this.bErrors = false;
    this.GeneralErrors = [];
    this.alert = false;
  }
}
