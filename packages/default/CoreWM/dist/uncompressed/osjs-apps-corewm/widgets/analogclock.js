define(['../widget'], function (Widget) {
    'use strict';
    return class WidgetAnalogClock extends Widget {
        constructor(settings) {
            super('AnalogClock', {
                width: 300,
                height: 300,
                aspect: true,
                top: 100,
                right: 20,
                canvas: true,
                frequency: 1,
                resizable: true,
                viewBox: true
            }, settings);
            this.radius = 300 / 2;
        }
        onRender() {
            if (!this._$canvas) {
                return;
            }
            const ctx = this._$context;
            const radius = Math.round(this.radius * 0.95);
            function drawHand(ctx, pos, length, width) {
                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.lineCap = 'round';
                ctx.moveTo(0, 0);
                ctx.rotate(pos);
                ctx.lineTo(0, -length);
                ctx.stroke();
                ctx.rotate(-pos);
            }
            ctx.clearRect(0, 0, this.radius * 2, this.radius * 2);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.lineWidth = radius * 0.04;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.font = radius * 0.15 + 'px arial';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            let ang;
            for (let num = 1; num < 13; num++) {
                ang = num * Math.PI / 6;
                ctx.rotate(ang);
                ctx.translate(0, -radius * 0.85);
                ctx.rotate(-ang);
                ctx.fillText(num.toString(), 0, 0);
                ctx.rotate(ang);
                ctx.translate(0, radius * 0.85);
                ctx.rotate(-ang);
            }
            const now = new Date();
            let hour = now.getHours();
            let minute = now.getMinutes();
            let second = now.getSeconds();
            hour = hour % 12;
            hour = hour * Math.PI / 6 + minute * Math.PI / (6 * 60) + second * Math.PI / (360 * 60);
            minute = minute * Math.PI / 30 + second * Math.PI / (30 * 60);
            second = second * Math.PI / 30;
            drawHand(ctx, hour, radius * 0.5, radius * 0.07);
            drawHand(ctx, minute, radius * 0.8, radius * 0.07);
            drawHand(ctx, second, radius * 0.9, radius * 0.02);
        }
        onResize(dimension) {
            if (!this._$canvas || !this._$context) {
                return;
            }
            this.radius = dimension.height / 2;
            this._$context.translate(this.radius, this.radius);
        }
    };
});