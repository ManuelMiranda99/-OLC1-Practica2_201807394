import { Component, OnInit } from '@angular/core';
import { Token } from 'src/app/Classes/Token';
import { LexicalAnalyzer } from 'src/app/Classes/lexicalAnalyzer';
import { Tab } from 'src/app/Classes/Tab';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms'
import { SyntacticAnalyzer } from 'src/app/Classes/syntacticAnalizer';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {

  tokenList = new Array<Token>();
  analyzer = new LexicalAnalyzer();
  parser = new SyntacticAnalyzer();
  sintacticErrors = new Array<string>();
  showF = false;
  save = false;
  fileNameSave = "DocumentoCS.cs";
  actualTab: Tab = new Tab("", "", "");
  public static countOfTabs = 0;

  tabs = new Array<Tab>();

  constructor() {}

  ngOnInit(): void {
    document.getElementById('mi-file').addEventListener('change', this.openFile, false);
  }












  analizeText(Form: NgForm, actualTab: Tab){

    let text = Form.value.text;    

    this.tokenList = this.analyzer.scanText(text);

    let flag = false;
    for(let token of this.tokenList){
      if(token.type === "UNKNOWN"){
        flag = true;
        break;
      }
    }

    for(let token of this.tokenList){
      if(token.type === "HTML_STRING"){
        // Analize HTML text
      }
    }

    this.sintacticErrors = this.parser.Start(this.tokenList);

    if(this.sintacticErrors.length > 0){
      actualTab.pythonText = "Errores sintacticos. No se puede generar traduccion\n\n";
      for(let i = 0; i < this.sintacticErrors.length; i++){
        actualTab.pythonText += "\t\t" + this.sintacticErrors[i] + "\n";
      }
    }
    else{
      actualTab.pythonText = this.parser.traductor.text;
    }    

  }











  
  // Adding tabs to the screen
  addTab(){
    this.tabs.push(new Tab("TabNo" + MainComponent.countOfTabs, "Nuevo" + MainComponent.countOfTabs, ""));
    this.fileNameSave = "Nuevo" + MainComponent.countOfTabs + ".cs";
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

    downloadLink.download = this.fileNameSave;

    this.actualTab.name = this.fileNameSave;

    downloadLink.innerHTML = "GG?";

    window.URL = window.URL || window.webkitURL;

    downloadLink.href = window.URL.createObjectURL(textFileBlob);

    downloadLink.style.display = "none";

    document.body.appendChild(downloadLink);

    downloadLink.click();
    
    this.save = false;
  }
}
