/**
 * Created by dister on 12/14/2016.
 */
import { Component, Input, OnInit  } from '@angular/core';
import {DadChart} from "./chart.component";
import {DadWidgetDataService} from "./data.service";
import {Mapper} from "./mapper";

export class DadWidget {
  id: string;
  name: string;
  parameters: any[];
  endpoint :string;
  a: string;
  b: string;
  chart?: DadChart;
}

@Component({
  selector: 'dadwidget',
  providers:[DadWidgetDataService],
  template: ` <!--  BEGIN CHART COMPONENT -->
    <div class="widget1">
    <table id="widgetTable">
    <th><div id="widgetName">{{widget.name}}</div></th>
        <tr>
            <div id="values" *ngIf="data"><a style="color:blue;" href="/table">{{data.Metric[0]}}</a>{{"/"}}{{data.Dimension[data.Metric[0]]}}</div>
            
            <div id="widgetDate">
            <label>Date: </label>
            <input [(ngModel)]="widget.parameters[0].date" placeholder=" yyyy-mm-dd"> 
            </div>
            
            <div id="widgetStartTime">
            <label>Start Time: </label>
            <input [(ngModel)]="this.widget.parameters[0].startTime" placeholder="hh:mm am">
            </div>
            
            <div id="widgetDuration">
            <label>Duration: </label>
            <input [(ngModel)]="this.widget.parameters[0].duration" placeholder="8h">
            </div>
        </tr>
    </table>
    </div>
  <!-- to show chart in widgets, use the line below-->
  <!--<dadchart [chart]="widget.chart"></dadchart>-->

    <!--  END CHART COMPONENT -->`
})
export class DadWidgetComponent implements OnInit {
  @Input()
  widget: DadWidget;
  data;
  mapper: Mapper = new Mapper();

  constructor(private dadWidgetDataService: DadWidgetDataService) { }

  ngOnInit() {
    console.log("Widgets are loading... :" + this.widget.id);
    this.dadWidgetDataService.getWidgetData(this.widget).then(
      data => {
        this.data = this.mapper.map(this.widget, data.data);
      }
    ).catch(err => console.log(err.toString()));
  }
}