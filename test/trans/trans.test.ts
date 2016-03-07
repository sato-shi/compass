import {expect} from 'chai';
import {fixture} from '../fixture';
import {Type} from 'vega-lite/src/type';
import * as consts from '../../src/consts';

import * as def from '../../src/trans/def'
import * as neighbor from '../../src/trans/neighbor';
import * as trans from '../../src/trans/trans';
import * as util from '../../src/util';
import {SchemaField} from '../../src/schema';

var startVL = {
  "data": { "url": "/data/cars.json" },
  "mark": "area",
  "transform": {"filter": "datum.Year > 1970 "},
  "encoding": {
    "x": { "type": "temporal", "field": "Year", "timeUnit": "year" },
    "y": { "type": "quantitative",
           "field": "*",
            "aggregate": "count"
      },
    "color": { "type": "nominal", "field": "Origin" }
  }
};

var destinationVL = {
  "data": { "url": "/data/cars.json" },
  "mark": "point",
  "encoding": {
    "x": { "type": "quantitative", "field": "Horsepower", "scale": {"type": "log"} },
    "y": {
      "type": "quantitative",
      "field": "Acceleration",
      "scale": {"type": "log"}
    },
    "color": {"type": "ordinal", "field":"Origin"}
  }
};

describe('cp.trans.trans', function () {
  describe('marktype transition', function () {
    it('should return a marktype transition correctly.', function () {
      expect(trans.marktypeTransitionSet(startVL, destinationVL)[0].cost)
           .to.eq(def.MARKTYPE_TRANSITIONS["AREA_POINT"].cost); //AREA_POINT
    });
  });

  describe('transform transition', function () {
    it('should return SCALE,AGGREGATE, and SORT transitions correctly.', function () {
      expect(trans.transformBasic(startVL, destinationVL, "y", "scale").cost).to.eq(def.TRANSFORM_TRANSITIONS["SCALE"].cost);
      expect(trans.transformBasic(startVL, destinationVL, "y", "aggregate").cost).to.eq(def.TRANSFORM_TRANSITIONS["AGGREGATE"].cost);
      expect(trans.transformBasic(startVL, destinationVL, "y", "sort")).to.eq(undefined);
    });
    it('should return FILTER transition correctly.', function () {
      expect(trans.transformFilter(startVL, destinationVL).name).to.eq("FILTER");
    });
    it('should return SETTYPE transition correctly.', function () {
      expect(trans.transformSettype(startVL, destinationVL, "color"  ).name).to.eq("SETTYPE");
    });

    it('should return all transitions without order.', function(){
      expect(trans.transformTransitionSet(startVL, destinationVL).length).to.eq(4);
    });
  });

  describe('encoding transition', function(){
    it('should return empty array if start is equal to dest.', function(){
      expect(trans.transformTransitionSet(startVL, startVL).length).to.eq(0);
    });
    it('should return all encoding transitions', function () {
      var source = {
        "data": {"url": "data/cars.json"},
        "mark": "point",
        "encoding": {
          "x": {"field": "Horsepower", "type": "quantitative"}
        }
      };
      var target1 = util.duplicate(source);
      target1.encoding.y = {"field": "Origin", "type": "ordinal"};
      var target2 = util.duplicate(target1);
      delete target2.encoding.x;
      target2.encoding.color = {"field": "Horsepower", "type": "quantitative"};

      var result1 = trans.encodingTransitionSet(source, target1);
      var result2 = trans.encodingTransitionSet(source, target2);
      var result3 = trans.encodingTransitionSet(startVL, destinationVL);

      expect(result1.length).to.eq(1);
      expect(result2.length).to.eq(2);
      expect(result3.length).to.eq(2);

      var destination = {
        "description": "A scatterplot showing horsepower and miles per gallons for various cars.",
        "data": {"url": "data/cars.json"},
        "mark": "point",
        "encoding": {
          "x": {"type": "quantitative","field": "Acceleration"},
          "y": {"type": "quantitative","field": "Horsepower"}
        }
      };


      var origin = {
        "description": "A scatterplot showing horsepower and miles per gallons for various cars.",
        "data": {"url": "data/cars.json"},
        "mark": "point",
        "encoding": {
          "x": {
            "type": "quantitative",
            "field": "Acceleration",
            "bin": true
          },
          "y": {
            "type": "quantitative",
            "field": "*",
            "scale": {"type": "log"},
            "aggregate": "count"
          }
        }
      };
      var result4 = trans.encodingTransitionSet(origin, destination);

      expect(result4.length).to.eq(1);
    });
  })

  describe('whole transition', function (){
    it('should return all transitions correctly.', function () {
      var result = trans.transitionSet(startVL, destinationVL);
      expect(result.marktype[0].cost).to.eq(def.MARKTYPE_TRANSITIONS["AREA_POINT"].cost);
      expect(result.transform.length).to.eq(4);
      expect(result.encoding.length).to.eq(2);

    });
  });
});