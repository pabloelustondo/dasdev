/**
 * Created by pablo elustondo Nov 2016
 */
import { Component, Input, OnInit, AfterViewInit  } from '@angular/core';
import { DadElementDataService } from './data.service';
import { Mapper } from "./mapper";
import { DadElement } from "./dadmodels";


declare var d3, c3: any;

export class DadChart extends DadElement{
    type: string;
    width: number;
    height: number;
    mini?: boolean = false;
    data?: any;
    regionM?:number;
    aname?: String;
    bname?: String;
}
@Component({
    selector: 'dadchart',
    providers:[DadElementDataService],
    template: ` <!--  BEGIN CHART COMPONENT -->
   <div class="col-sm-12 col-lg-6">        
          <div class="card card-inverse card-secondary">

                <div class="card-block pb-0">
     <div *ngIf="!chart.mini" class="btn-group float-xs-right" dropdown>
        <button style="color:black;" type="button" class="btn btn-transparent dropdown-toggle p-0" dropdownToggle>
            <i class="icon-settings"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-right" dropdownMenu>
            <button class="dropdown-item" style="cursor:pointer;"> <div (click)="onEdit('lalal')">Edit</div></button>
            <button class="dropdown-item" style="cursor:pointer;"> <div (click)="onRefresh()">Refresh</div></button>
        </div>
    </div>
    </div>

     <div *ngIf="chart.mini" style= "text-align:center; height:700px;  width:700px" [id]="chart.id"></div>
     <div *ngIf="!chart.mini">
             <a [routerLink]="['table', 100, chart.id]">
        <span style="color:black;">Drill down </span>
        </a>
       <div style="color:black; font-weight:bold;">{{chart.name}}</div> <br/><br/><br/>        
       <div style= "text-align:center; height:700px;  width:700px" [id]="chart.id"></div>
       <div style="margin-left: 15px; color:black;">
       <dadparameters [element]="chart" [editMode]="editMode" [onRefresh]="refreshMode" (parametersChanged)="changeConfig()"></dadparameters>  
       </div>
    </div>
        </div>
    </div>

    <!--  END CHART COMPONENT -->`
})
export class DadChartComponent implements OnInit {
    @Input()
    chart: DadChart
    @Input()
    data;
    mapper: Mapper = new Mapper();
    colorPalette: any[] = ['#33526e', '#618bb1', '#46c0ab', '#ff6b57', '#ff894c', '#62656a', '#f4d42f', '#60bd6e'];
    c3chart: any;
    miniChartWidth: number = 275;
    miniChartHeight: number = 200;
    miniChartColor: any[] = ['#33526e'];
    firstDate: any;
    secondDate: any;
    editMode:boolean = false;
    refreshMode:boolean = false;


  constructor(private dadChartDataService: DadElementDataService) { }
    onDateChanged(event:any) {
      console.log('onDateChanged(): ', event.date, ' - jsdate: ', new Date(event.jsdate).toLocaleDateString(), ' - formatted: ', event.formatted, ' - epoc timestamp: ', event.epoc);
    }

  onRefresh():void{
    if (!this.refreshMode) this.refreshMode = true;
    else this.refreshMode = false;
  }

  ngOnInit() {

    this.miniChartWidth = this.chart.width;
    this.miniChartHeight = this.chart.height;
    console.log("CHART starts drawing ON INIT:" + this.chart.id);
  }

  ngAfterViewInit() {
    console.log("CHART starts drawing AFTER VIEW INIT :" + this.chart.id);

    if (!this.data && this.chart.data){
      this.data = this.chart.data;
    }

    if (this.data){
      this.drawChart(this.chart,this.data);
    }
    else
    { //at this point we do not have this.data nor we have this.chart.date.. so we need to go to server
      this.dadChartDataService.getElementData(this.chart).then(
        data => {
          this.data = data.data;
          this.drawChart(this.chart, this.data);
        }
      ).catch(err => console.log(err.toString()));
    }

  }

  changeConfig(){
      this.dadChartDataService.getElementData(this.chart).then(
        data => {
          this.data = data.data;
          let chartData = this.mapper.map(this.chart, this.data);
          this.c3chart.load(chartData);
        }
      )
    }

  onEdit(message:string):void{
      if (!this.editMode) this.editMode = true;
      else this.editMode = false;
    }

  indexOfRegions(chartData:any){
    let M = this.chart.regionM;
    let Dimension = chartData.columns[0];
    var i;
    for(i=1; i<Dimension.length; i++){
      if( Dimension[i] >= M ) {
        return i-1;
      }
    }
    return 0;
  }

  //mini applied
  drawChartBar(chartConfig:DadChart, data){
      let chartData = this.mapper.map(chartConfig, data);
      let bardata = chartData;

    bardata.selection ={
      enabled:true,
    };
/*
    bardata.onclick = function (d) {
      alert('hello from chart');
    };
*/




    d3.selectAll(".c3-axis-x .tick").filter(function(d) {
        return d === 0;
      }).remove();


      let c3Config = {
      size: {
        height: chartConfig.height,
        width: chartConfig.width,
      },
      bindto: '#' + chartConfig.id,
      data: bardata,
      color: {
        pattern: this.colorPalette,
      },
      axis: {
        x: {
          type: 'category',
          show : true,
          label: {
            text: [chartConfig.bname],
              position: 'outer-right'
          },
          tick:{
            rotate:0,
            multiline:false
          }
        },
        y: {
          show : true,
          label: {
            text: [chartConfig.aname],
              position: 'outer-top'
          }
        }
      },
      grid: {
        x: {
          show: false
        },
        y: {
          show: true
        },
        focus: {
          show: false
        }
      },
      regions: [
        {start: this.indexOfRegions(chartData)},
      ],
      zoom: {
        enabled: true
      },
      /*subchart: {
        show: true
      },*/
      legend: {
        show: true
      },
      interaction: {
        enabled: true
      },
      bar:{
        width: {
          ratio: 0.7
        }
      }
    };
    if(chartConfig.mini){
      c3Config.size.width = this.miniChartWidth;
      c3Config.size.height = this.miniChartHeight;
      c3Config.legend.show = false;
      c3Config.axis.x.show = false;
      c3Config.axis.y.show = false;
      //c3Config.subchart.show = false;
      c3Config.zoom.enabled = false;
      c3Config.grid.y.show = false;
      c3Config.color.pattern = this.miniChartColor;
      c3Config.interaction.enabled = false;
      //c3Config.regions = false;
    };
    this.c3chart = c3.generate(c3Config);

      d3.selectAll(".c3-event-rect").on('click', function (id) {
          alert('fgafgr');
      });


  };
  //mini applied
  drawChartPie(chartConfig:DadChart, data) {
    let chartData = this.mapper.map(chartConfig, data);
    let c3Config = {
      size: {
        height: chartConfig.height,
        width: chartConfig.width
      },
      bindto: '#' + chartConfig.id,
      data: chartData,
      color: {
        pattern: this.colorPalette,
      },
      zoom: {
        enabled: true
      },
      legend: {
        show : true
      }
    };
    if(chartConfig.mini){
      c3Config.size.width = this.miniChartWidth;
      c3Config.size.height = this.miniChartHeight;
      c3Config.legend.show = false;
    };
    this.c3chart = c3.generate(c3Config);
  };
  //mini applied
  drawChartDot(chartConfig:DadChart, data) {
    let chartData = this.mapper.map(chartConfig, data);

    d3.selectAll(".c3-axis-x .tick").filter(function(d) {
        return d === 0;
      }).remove();
    let c3Config = {
      size: {
        height: chartConfig.height,
        width: chartConfig.width
      },
      bindto: '#' + chartConfig.id,
      data: chartData,
      color: {
        pattern: this.colorPalette,
      },
      grid: {
        focus: {
          show:true
        },
        x: {
          show: true
        },
        y: {
          show: true
        }
      },
      tooltip: {
        grouped: false,
        format: {
          title: function () {
            return ([chartConfig.b]);
          },
        }
      },
      axis: {
        x: {
          show: true,
          label: {
            text: [chartConfig.b],
            position: 'outer-right'
          }
        },
        y: {
          show: true,
          label: {
            text: [chartConfig.a],
            position: 'outer-top'
          }
        }
      },
      zoom: {
        enabled: true
      },
      subchart: {
        show: true
      },
      legend: {
        show: true
      }
    };
    if(chartConfig.mini){
      c3Config.size.width = this.miniChartWidth;
      c3Config.size.height = this.miniChartHeight;
      c3Config.legend.show = false;
      c3Config.axis.x.show = false;
      c3Config.axis.y.show = false;
      c3Config.subchart.show = false;
      c3Config.zoom.enabled = false;
      c3Config.grid.y.show = false;
      c3Config.grid.focus.show = false;
    };
    this.c3chart = c3.generate(c3Config);
  };
  //mini applied
  drawChartSpline(chartConfig:DadChart, data){
    let chartData = this.mapper.map(chartConfig, data);

    let splinedata = chartData;
    splinedata.selection={
      enabled:true
    };

    d3.selectAll(".c3-axis-x .tick").filter(function(d) {
        return d === 0;
      }).remove();
    let c3Config = {
      size: {
        height: chartConfig.height,
        width: chartConfig.width
      },
      bindto: '#' + chartConfig.id,
      data: splinedata,
      grid: {
        x: {
          show: true
        },
        y: {
          show: true
        },
        focus: {
          show: true
        }
      },
      color: {
        pattern: this.colorPalette,
      },
      axis: {
        x: {
          type: 'category',
          categories: chartData.x,
          show: true,
          label: {
            text: [chartConfig.a],
            position: 'outer-right'
          }
        },
        y: {
          show: true,
          label: {
            text: [chartConfig.b],
            position: 'outer-top'
          }
        }
      },
      zoom: {
        enabled: true
      },
      subchart: {
        show: true
      },
      legend: {
        show: true
      }
    };
    if(chartConfig.mini){
      c3Config.size.width = this.miniChartWidth;
      c3Config.size.height = this.miniChartHeight;
      c3Config.legend.show = false;
      c3Config.axis.x.show = false;
      c3Config.axis.y.show = false;
      c3Config.subchart.show = false;
      c3Config.zoom.enabled = false;
      c3Config.grid.y.show = false;
      c3Config.grid.focus.show = false;
    };
    this.c3chart = c3.generate(c3Config);
  }
  //mini applied
  drawChartDonut(chartConfig:DadChart, data) {
    let chartData = this.mapper.map(chartConfig, data);
    let c3Config = {
      size: {
        height: chartConfig.height,
        width: chartConfig.width
      },
      bindto: '#' + chartConfig.id,
      data: chartData,
      color: {
        pattern: this.colorPalette,
      },
      legend: {
        show: true
      }
    };
    if(chartConfig.mini){
      c3Config.size.width = this.miniChartWidth;
      c3Config.size.height = this.miniChartHeight;
      c3Config.legend.show = false;
    };
    this.c3chart = c3.generate(c3Config);
  };

  drawChart(chartConfig:DadChart, data) {
      if (chartConfig.type === 'bar') this.drawChartBar(chartConfig, data);
      if (chartConfig.type === 'pie') this.drawChartPie(chartConfig, data);
      if (chartConfig.type === 'dot') this.drawChartDot(chartConfig, data);
      if (chartConfig.type === 'spline') this.drawChartSpline(chartConfig, data);
      if (chartConfig.type === 'donut') this.drawChartDonut(chartConfig, data);
  }
}


