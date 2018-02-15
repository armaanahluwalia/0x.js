var fs = require('fs');
var SimpleMarkdown = require("simple-markdown");
var cwd = __dirname;
var PUBLIC_FOLDER = cwd + '/../public/';
var imageTemplateHeader = fs.readFileSync(cwd + '/imageHeader.html', "utf8");
var imageTemplateFooter = fs.readFileSync(cwd + '/imageFooter.html', "utf8");
var tokenSymbolMap = {
    REP: '/images/token_icons/augur.png',
    DGD: '/images/token_icons/digixdao.png',
    WETH: '/images/token_icons/ether_erc20.png',
    MLN: '/images/token_icons/melon.png',
    GNT: '/images/token_icons/golem.png',
    MKR: '/images/token_icons/makerdao.png',
    ZRX: '/images/token_icons/zero_ex.png',
    ANT: '/images/token_icons/aragon.png',
    BNT: '/images/token_icons/bancor.png',
    BAT: '/images/token_icons/basicattentiontoken.png',
    CVC: '/images/token_icons/civic.png',
    EOS: '/images/token_icons/eos.png',
    FUN: '/images/token_icons/funfair.png',
    GNO: '/images/token_icons/gnosis.png',
    ICN: '/images/token_icons/iconomi.png',
    OMG: '/images/token_icons/omisego.png',
    SNT: '/images/token_icons/status.png',
    STORJ: '/images/token_icons/storjcoinx.png',
    PAY: '/images/token_icons/tenx.png',
    QTUM: '/images/token_icons/qtum.png',
    DNT: '/images/token_icons/district0x.png',
    SNGLS: '/images/token_icons/singularity.png',
    EDG: '/images/token_icons/edgeless.png',
    '1ST': '/images/token_icons/firstblood.jpg',
    WINGS: '/images/token_icons/wings.png',
    BQX: '/images/token_icons/bitquence.png',
    LUN: '/images/token_icons/lunyr.png',
    RLC: '/images/token_icons/iexec.png',
    MCO: '/images/token_icons/monaco.png',
    ADT: '/images/token_icons/adtoken.png',
    CFI: '/images/token_icons/cofound-it.png',
    ROL: '/images/token_icons/etheroll.png',
    WGNT: '/images/token_icons/golem.png',
    MTL: '/images/token_icons/metal.png',
    NMR: '/images/token_icons/numeraire.png',
    SAN: '/images/token_icons/santiment.png',
    TAAS: '/images/token_icons/taas.png',
    TKN: '/images/token_icons/tokencard.png',
    TRST: '/images/token_icons/trust.png',
};

function generateMatchFn(matchRegEx) {
  return function(source) {
      return matchRegEx.exec(source);
  }
}
function ruleCaptureFn(capture, parse, state) {
   return {
       content: parse(capture[1], state)
   }
 }
 function createImgFn(src) {
   return function imgHtmlFn(node, output) {
       return '<img src="'+ src + '" style="width: 1em; height: 1em; margin-top: -0.1em; vertical-align: middle;"/>';
   }
 }
 function createHtmlTextFn(content, style) {
   return function htmlTextFn(node) {
     let text = content || node.content;
     if(style) {
         return '<span style="' + style + '">' + text + '</style>'
     } else {
       return '<span>' + text + '</span>'
     }
   }
 }
function generateImageHTML(order) {
  var rules = {};
  function addRule(name, matchFn, parseFn, htmlFn) {
    if(rules[name]) return console.error('Rule already exists');
    rules[name] = {
        // Specify the order in which this rule is to be run
        order: SimpleMarkdown.defaultRules.em.order - 0.5,
        // First we check whether a string matches
        match: matchFn,
        // Then parse this string into a syntax node
        parse: parseFn,
        // Or an html element:
        // (Note: you may only need to make one of `react:` or
        // `html:`, as long as you never ask for an outputter
        // for the other type.)
        html: htmlFn,
    };
  };

  // Maker Token Logo
  addRule('maker-token-logo',
    generateMatchFn(/^<<MAKER_TOKEN_LOGO>>/),
    ruleCaptureFn,
    createImgFn(PUBLIC_FOLDER + tokenSymbolMap[order.maker.token.symbol])
  );
  // Maker Token Symbol
  addRule('maker-token-symbol',
    generateMatchFn(/^<<MAKER_TOKEN_SYMBOL>>/),
    ruleCaptureFn,
    createHtmlTextFn(order.maker.token.symbol)
  );
  // Maker Token Amount
  addRule('maker-token-amount',
    generateMatchFn(/^<<MAKER_TOKEN_AMOUNT>>/),
    ruleCaptureFn,
    createHtmlTextFn((order.maker.amount / Math.pow(10,order.maker.token.decimals)).toString())
  );
  // Taker Token Logo
  addRule('taker-token-logo',
    generateMatchFn(/^<<TAKER_TOKEN_LOGO>>/),
    ruleCaptureFn,
    createImgFn(PUBLIC_FOLDER + tokenSymbolMap[order.taker.token.symbol])
  );
  // Taker Token Symbol
  addRule('taker-token-symbol',
    generateMatchFn(/^<<TAKER_TOKEN_SYMBOL>>/),
    ruleCaptureFn,
    createHtmlTextFn(order.taker.token.symbol)
  );
  // Taker Token Amount
  addRule('taker-token-amount',
    generateMatchFn(/^<<TAKER_TOKEN_AMOUNT>>/),
    ruleCaptureFn,
    createHtmlTextFn((order.taker.amount / Math.pow(10,order.taker.token.decimals)).toString())
  );

  var rules = Object.assign({}, SimpleMarkdown.defaultRules, rules);
  var rawBuiltParser = SimpleMarkdown.parserFor(rules);
  var parse = function(source) {
      var blockSource = source + "\n\n";
      return rawBuiltParser(blockSource, {inline: false});
  };
  var htmlOutput = SimpleMarkdown.htmlFor(SimpleMarkdown.ruleOutput(rules, 'html'));
  var syntaxTree = parse(order.thumbnailContent);
  console.log(htmlOutput(syntaxTree));
  return imageTemplateHeader
    + htmlOutput(syntaxTree)
    + imageTemplateFooter;
}

module.exports = generateImageHTML;
