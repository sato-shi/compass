import {expect} from 'chai';
import {fixture} from '../fixture';
import * as vlShorthand from 'vega-lite/src/shorthand';
import {ORDINAL} from 'vega-lite/src/type';
import genEncodings from '../../src/gen/encodings';
import {DEFAULT_SPEC_OPTION} from '../../src/consts';
import {extend} from '../../src/util';

describe('cp.gen.encodings()', function () {
  describe('#', function () {
    var f;

    beforeEach(function() {
      f = fixture['#'];
    });

    it('should generate one encodings', function() {
      var encodings = genEncodings([], f.fields, f.stats);
      expect(encodings.length).to.eql(1);
      expect(encodings[0].x).to.be.ok;
    });
  });

  describe('1Q,', function() {
    // FIXME write tests
  });

  describe('#xB(Q)', function() {
    var f, encodings, encShorthands;
    beforeEach(function() {
      f = fixture['#xB(Q)'];
      encodings = genEncodings([], f.fields, f.stats);
      encShorthands = encodings.map(vlShorthand.shortenEncoding);
    });

    it('should show only vertical bar/plots', function() {
      expect(encShorthands.indexOf('x=count_*,Q|y=bin_2,Q')).to.equal(-1);
      expect(encShorthands.indexOf('x=bin_2,Q|y=count_*,Q')).to.gt(-1);
    });

  });

  describe('#xT', function() {
    var f, encodings, encShorthands;
    beforeEach(function() {
      f = fixture['#xT'];
      encodings = genEncodings([], f.fields, f.stats);
      encShorthands = encodings.map(vlShorthand.shortenEncoding);
    });

    it('should show only vertical bar/plots', function() {
      expect(encShorthands.indexOf('x=count_*,Q|y=2,T')).to.equal(-1);
      expect(encShorthands.indexOf('x=2,T|y=count_*,Q')).to.gt(-1);
    });
  });

  describe('#xYR(T)', function() {
    var f, encodings, encShorthands;
    beforeEach(function() {
      f = fixture['#xYR(T)'];
      encodings = genEncodings([], f.fields, f.stats);
      encShorthands = encodings.map(vlShorthand.shortenEncoding);
    });

    it('should show only vertical bar/plots', function() {
      expect(encShorthands.indexOf('x=count_*,Q|y=year_2,T')).to.equal(-1);
      expect(encShorthands.indexOf('x=year_2,T|y=count_*,Q')).to.gt(-1);
    });
  });

  describe('QxT', function () {
    var f, encodings, encShorthands;
    beforeEach(function() {
      f = fixture['QxT'];
      encodings = genEncodings([], f.fields, f.stats);
      encShorthands = encodings.map(vlShorthand.shortenEncoding);
    });
    it('should show only vertical bar/plots', function() {
      expect(encShorthands.indexOf('x=1,Q|y=2,T')).to.equal(-1);
      expect(encShorthands.indexOf('x=2,T|y=1,Q')).to.gt(-1);
    });
  });

  // describe('QxO,', function() {
  //
  // });

  // describe('QxA(Q),', function() {
  //
  // });

  describe('OxOxQ', function () {
    var f;
    beforeEach(function() {
      f = fixture.OxOxQ;
    });

    it('without stats about occlusion, it should not include charts with both O\'s on axes', function() {
      var encodings = genEncodings([], f.fields, f.stats);

      var filtered = encodings.filter(function(encoding){
        return encoding.x.type === ORDINAL && encoding.y.type === ORDINAL;
      });

      expect(filtered.length).to.equal(0);
    });
  });

  describe('OxOxA(Q)', function () {
    var f;
    beforeEach(function() {
      f = fixture['OxOxA(Q)'];
    });

    it('without stats about occlusion, it should include charts with both O\'s on axes', function() {
      var encodings = genEncodings([], f.fields, f.stats);

      var filtered = encodings.filter(function(encoding){
        return encoding.x && encoding.x.type === ORDINAL && encoding.y && encoding.y.type === ORDINAL;
      });

      expect(filtered.length).to.gt(0);
    });
  });

  describe('OxA(Q)xA(Q)', function () {
    var f, fields, stats;
    beforeEach(function() {
      f = fixture['OxA(Q)xA(Q)'];
      fields = f.fields;
      stats = f.stats;
    });

    it('should not include charts with O on row/column except with text', function() {
      var encodings = genEncodings([], fields, stats);

      expect(encodings.filter(function(encoding) {
        var rowIsO = encoding.row && encoding.row.type === ORDINAL,
          colIsO = encoding.column && encoding.column.type === ORDINAL;
        return !encoding.text && (rowIsO || colIsO);
      }).length).to.equal(0);
    });

    it('should include charts with O on row/column when omit flag is disabled', function() {
      const opt = extend({}, DEFAULT_SPEC_OPTION, {omitNonTextAggrWithAllDimsOnFacets: false});
      var encodings = genEncodings([], fields, stats, opt);
      expect(encodings.filter(function(encoding) {
        return (encoding.row && encoding.row.type === ORDINAL) ||
          (encoding.column && encoding.column.type === ORDINAL);
      }).length).to.gt(0);
    });
  });
});
