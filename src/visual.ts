/*
 *  Chart Placeholder by OKViz
 *
 *  Copyright (c) SQLBI. OKViz is a trademark of SQLBI Corp.
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {

    interface VisualMeta {
        name: string;
        version: string;
        dev: boolean;
    }

    interface VisualViewModel {
        dataPoints: VisualDataPoint[];
        settings: VisualSettings;
    }

    interface VisualDataPoint {
        value: number;
        selectionId: any;
    }

    interface VisualSettings {
        placeholder: {
            showSize: boolean;
            showIcon: boolean;
            kind: string;
            text: string;
            textSize: number;
            stroke: Fill;
        };
    }

    function defaultSettings(): VisualSettings {
        return {
            placeholder: {
                showSize: true,
                showIcon: true,
                kind: "barchart",
                text: "Chart Placeholder",
                textSize: 16,
                stroke: { solid: { color: "#777" } }
            }
        };
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): VisualViewModel {

        //Get DataViews
        let dataViews = options.dataViews;
        let hasDataViews = (dataViews && dataViews[0]);
        let hasCategoricalData = (hasDataViews && dataViews[0].categorical && dataViews[0].categorical.categories && dataViews[0].categorical.categories[0].source && dataViews[0].categorical.values);
        let hasSettings = (hasDataViews && dataViews[0].metadata && dataViews[0].metadata.objects);

        //Get Settings
        let settings: VisualSettings = defaultSettings();
        if (hasSettings) {
            let objects = dataViews[0].metadata.objects;
            settings = {
                placeholder: {
                    showSize: getValue<boolean>(objects, 'placeholder', 'showSize', settings.placeholder.showSize),
                    showIcon: getValue<boolean>(objects, 'placeholder', 'showIcon', settings.placeholder.showIcon),
                    kind: getValue<string>(objects, 'placeholder', 'kind', settings.placeholder.kind),
                    text: getValue<string>(objects, 'placeholder', 'text', settings.placeholder.text),
                    textSize: getValue<number>(objects, 'placeholder', 'textSize', settings.placeholder.textSize),
                    stroke: getValue<Fill>(objects, 'placeholder', 'stroke', settings.placeholder.stroke),
                }
            }


        }

        //Get DataPoints
        let dataPoints: VisualDataPoint[] = [];
        if (hasCategoricalData) {

        }

        return {
            dataPoints: dataPoints,
            settings: settings,
        };
    }

    export class Visual implements IVisual {
        private meta: VisualMeta;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private model: VisualViewModel;

        private element: HTMLElement;

        private container: JQuery;
        private sizeToolbar: JQuery;
        private kind: JQuery;
        private label: JQuery;

        constructor(options: VisualConstructorOptions) {

            this.meta = {
                name: 'Chart Placeholder',
                version: '1.0.0',
                dev: false
            };
            console.log('%c' + this.meta.name + ' by OKViz ' + this.meta.version + (this.meta.dev ? ' (BETA)' : ''), 'font-weight:bold');

            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.model = { dataPoints: [], settings: <VisualSettings>{} };

            this.element = options.element;
            this.container = $('<div />').addClass('placeholder').appendTo(this.element);
            this.sizeToolbar = $('<div />').addClass('toolbar').appendTo(this.element);
            this.label = $('<div />').addClass('label').appendTo(this.container);
            this.kind = $('<div />').addClass('kind').appendTo(this.container);
        }
        
        public update(options: VisualUpdateOptions) {

            this.model = visualTransform(options, this.host);
    
            //Render visual
            let containerPadding = 5;

            this.container.width(options.viewport.width-containerPadding).height(options.viewport.height-containerPadding);

            this.container.css('border', '2px solid ' + this.model.settings.placeholder.stroke.solid.color);

            this.sizeToolbar.html('<strong>' + Math.round(options.viewport.width+(containerPadding*2)) + '</strong> x <strong>' + Math.round(options.viewport.height+(containerPadding*2)) + '</strong>');
            this.sizeToolbar.css(
                {
                    'background': this.model.settings.placeholder.stroke.solid.color,
                    'color': OKVizUtility.autoTextColor(this.model.settings.placeholder.stroke.solid.color)
                }
            );
            this.sizeToolbar.toggle(this.model.settings.placeholder.showSize);

            this.label.text(this.model.settings.placeholder.text);
            this.label.css({
                'font-size': this.model.settings.placeholder.textSize + 'px'
            });

            this.kind.html('<div class="' + this.model.settings.placeholder.kind + '" />');
            this.kind.toggle(this.model.settings.placeholder.showIcon);

            this.label.css('padding-top', (this.model.settings.placeholder.showIcon || this.model.settings.placeholder.showSize ? '30px' : '10px'));

            OKVizUtility.t([this.meta.name, this.meta.version], this.element, options, this.host, {
                'cd15': this.meta.dev
            });
        }

        public destroy(): void {
            //TODO: Perform any cleanup tasks here
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];

            switch(objectName) {
                case "placeholder":

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "showSize": this.model.settings.placeholder.showSize,
                            "showIcon": this.model.settings.placeholder.showIcon,
                            "kind": this.model.settings.placeholder.kind,
                            "text": this.model.settings.placeholder.text,
                            "textSize": this.model.settings.placeholder.textSize,
                            "stroke": this.model.settings.placeholder.stroke
                        },
                        selector: null
                    });
                    break;
                
            };

            return objectEnumeration;
        }
    }
}