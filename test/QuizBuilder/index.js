var expect = require("chai").expect;
var QuizBuilder = require('../../QuizBuilder');
var randomModule = require("../../random");

describe('QuizBuilder', function() {
	var qd = {
	    "version" : "0.1",
	    "questions": [{
		    "question": "binHexOctDec",
		    "repeat": 5,
		}]
	};

	describe('build(descriptor, hexStringSeed)', function() {

		describe('invalid descriptor', function() {
			var invalidQD = {
			    "ayyyy" : "lmao"
			};
			it('should throw an error', function() {
				expect(function(){ QuizBuilder.build(invalidQD, '1234abcd'); }).to.throw(Error);
			});
		});

		describe('invalid seed', function() {
			it('should throw an error', function() {
				expect(function(){ QuizBuilder.build(qd, '1234'); }).to.throw(Error);
			});
		});

	});

	describe('validateQuizDescriptor(qd)', function() {
		describe('valid qds', function() {
			var errors;
			before(function() {
				errors = QuizBuilder.validateQuizDescriptor({
					version: '0.1',
					questions: [
						{
							question: 'binHexOctDec',
							repeat: 1,
							parameters: {
								spaceBinary: true
							}
						}
					]
				});
			});
			it('should return an empty array', function() {
				expect(errors).to.be.an('array');
				expect(errors.length).to.equal(0);
			});
		});
		describe('invalid qds', function() {
			describe('when qd is undefined', function() {
				var errors;
				before(function() {
					errors = QuizBuilder.validateQuizDescriptor();
				});
				it('should return an array of length 1', function() {
					expect(errors).to.be.an('array');
					expect(errors.length).to.equal(1);
				});
				describe('error type', function() {
					it('should be UndefinedQuizDescriptor', function() {
						expect(errors[0].type).to.equal('UndefinedQuizDescriptor');
					});
				});
				describe('error path', function() {
					it('should be []', function() {
						expect(errors[0].path).to.eql([]);
					});
				});
			});
			describe('when qd is not an object', function() {
				var errors;
				before(function() {
					errors = QuizBuilder.validateQuizDescriptor('');
				});
				it('should return an array of length 1', function() {
					expect(errors).to.be.an('array');
					expect(errors.length).to.equal(1);
				});
				describe('error type', function() {
					it('should be ExpectedObjectError', function() {
						expect(errors[0].type).to.equal('ExpectedObjectError');
					});
				});
				describe('error path', function() {
					it('should be []', function() {
						expect(errors[0].path).to.eql([]);
					});
				});
			});
			describe('version', function() {
				describe('when undefined', function() {
					var errors;
					before(function() {
						errors = QuizBuilder.validateQuizDescriptor({
							questions: []
						});
					});
					it('should return an array of length 1', function() {
						expect(errors).to.be.an('array');
						expect(errors.length).to.equal(1);
					});
					describe('error type', function() {
						it('should be RequiredError', function() {
							expect(errors[0].type).to.equal('RequiredError');
						});
					});
					describe('error path', function() {
						it('should be ["version"]', function() {
							expect(errors[0].path).to.eql(['version']);
						});
					});
				});
				describe('when not a string', function() {
					var errors;
					before(function() {
						errors = QuizBuilder.validateQuizDescriptor({
							version: true,
							questions: []
						});
					});
					it('should return an array of length 1', function() {
						expect(errors).to.be.an('array');
						expect(errors.length).to.equal(1);
					});
					describe('error type', function() {
						it('should be ExpectedStringError', function() {
							expect(errors[0].type).to.equal('ExpectedStringError');
						});
					});
					describe('error path', function() {
						it('should be ["version"]', function() {
							expect(errors[0].path).to.eql(['version']);
						});
					});
				});
			});
			describe('questions', function() {
				describe('when undefined', function() {
					var errors;
					before(function() {
						errors = QuizBuilder.validateQuizDescriptor({
							version: "0.1"
						});
					});
					it('should return an array of length 1', function() {
						expect(errors).to.be.an('array');
						expect(errors.length).to.equal(1);
					});
					describe('error type', function() {
						it('should be RequiredError', function() {
							expect(errors[0].type).to.equal('RequiredError');
						});
					});
					describe('error path', function() {
						it('should be ["questions"]', function() {
							expect(errors[0].path).to.eql(['questions']);
						});
					});
				});
				describe('when not an array', function() {
					var errors;
					before(function() {
						errors = QuizBuilder.validateQuizDescriptor({
							version: "0.1",
							questions: {}
						});
					});
					it('should return an array of length 1', function() {
						expect(errors).to.be.an('array');
						expect(errors.length).to.equal(1);
					});
					describe('error type', function() {
						it('should be ExpectedArrayError', function() {
							expect(errors[0].type).to.equal('ExpectedArrayError');
						});
					});
					describe('error path', function() {
						it('should be ["questions"]', function() {
							expect(errors[0].path).to.eql(['questions']);
						});
					});
				});
			});
			describe('parameters', function() {
				describe('invalid', function() {
					var errors;
					before(function() {
						errors = QuizBuilder.validateQuizDescriptor({
							version: "0.1",
							questions: [
								{ question: 'changeOfBase', repeat:1 },
								{
									question: 'binHexOctDec',
									repeat: 1,
									parameters: {
										conversions: [
											{ radix: { from:2, to:10 }, range: {min:0, max:63} },
											{ radix: { from:1, to:10 }, range: {min:0, max:63} }
										]
									}
								}
							]
						});
					});
					it('should return an array of length 1', function() {
						expect(errors).to.be.an('array');
						expect(errors.length).to.equal(1);
					});
					describe('error type', function() {
						it('should be MinimumValueError', function() {
							expect(errors[0].type).to.equal('MinimumValueError');
						});
					});
					describe('error path', function() {
						it('should be ["questions", 1, "parameters", "conversions", 1, "radix", "from"]', function() {
							expect(errors[0].path).to.eql(["questions", 1, "parameters", "conversions", 1, "radix", "from"]);
						});
					});
				});
			});
		});
	});
	describe('checkSeed(seed)', function() {

		it('should reject any non string', function() {
			expect(QuizBuilder.checkSeed(parseInt('ABCD1234', 16))).to.be.false;
			expect(QuizBuilder.checkSeed(null)).to.be.false;
			expect(QuizBuilder.checkSeed(undefined)).to.be.false;
			expect(QuizBuilder.checkSeed(true)).to.be.false;
		});

		it('should reject strings that are not of length 8', function() {
			expect(QuizBuilder.checkSeed("1234567")).to.be.false;
			expect(QuizBuilder.checkSeed("12345678A")).to.be.false;
		});

		it('should accept hex strings of length 8', function() {
			expect(QuizBuilder.checkSeed("12345678")).to.be.true;
			expect(QuizBuilder.checkSeed("abcdef00")).to.be.true;
		});
	});
});






