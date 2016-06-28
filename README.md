# angular-material-timeroller
Time roller for [angular material](https://github.com/angular/bower-material)

## Prerequisites

  * [Angular Material](https://github.com/angular/bower-material)
  * [D3.js](https://github.com/mbostock-bower/d3-bower)

## Exemple

```html
<md-dialog aria-label="DateRoller">
    <form ng-submit="ctrl.answer()">
        <md-toolbar>
            <div class="md-toolbar-tools">
                <h2 flex>{{ctrl.value | date: "EEEE"}}</h2>
                <md-button ng-click="ctrl.close()" aria-label="Close" class="md-icon-button">
                    <md-icon md-svg-src="/assets/icons/times.svg"></md-icon>
                </md-button>
            </div>  
		</md-toolbar>
        <md-dialog-content>
            <div layout="column" layout-align="space-around center">
                <div>{{ctrl.value | date: "d"}}</div>
                <div>
                    <strong>{{ctrl.value | date: "MMMM"}}</strong>
                </div>
                <div>
                    <em>{{ctrl.value | date: "yyyy"}}</em>
                </div>
            </div>
            <timeroller ng-model="ctrl.value"></timeroller>
        </md-dialog-content>
        <md-dialog-actions>
            <md-button type="submit" class="md-primary" aria-label="Validate">Valider</md-button>
        </md-dialog-actions>
    </form>
</md-dialog>
```