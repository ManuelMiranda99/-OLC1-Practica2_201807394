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
  public static countOfTabs = 0;

  tabs = new Array<Tab>();

  constructor() {}

  ngOnInit(): void {
    document.getElementById('mi-file').addEventListener('change', this.openFile, false);
  }

  analizeText(Form: NgForm){

    let text = Form.value.text;    

    this.tokenList = this.analyzer.scanText(text);

    let flag = false;
    for(let token of this.tokenList){
      if(token.type === "UNKNOWN"){
        flag = true;
        break;
      }
    }

    this.sintacticErrors = this.parser.Start(this.tokenList);

  }

  addTab(){
    this.tabs.push(new Tab("TabNo" + MainComponent.countOfTabs, "Nuevo" + MainComponent.countOfTabs, ""));
    MainComponent.countOfTabs++;
  }
  
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
      console.log(text);
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
  }

}
