import { Component, OnInit } from '@angular/core';
import { Token } from 'src/app/Classes/Token';
import { LexicalAnalyzer } from 'src/app/Classes/lexicalAnalyzer';
import { Tab } from 'src/app/Classes/Tab';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  tokenList = new Array<Token>();
  analyzer = new LexicalAnalyzer();
  countOfTabs = 0;

  tabs = new Array<Tab>();

  constructor() {}

  ngOnInit(): void {
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
    if(flag){
      this.analyzer.GenerateErrorsReport(this.tokenList);
    }

  }

  addTab(){
    this.tabs.push(new Tab("TabNo" + this.countOfTabs, "Nuevo" + this.countOfTabs, ""));
    this.countOfTabs++;
  }

}
