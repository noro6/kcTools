/**
 * Created by romulus on 2014/9/10.
 */
// 0123456789,|.:
var CODE = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111',
   '1000', '1001', '1010', '1011', '1100', '1101']

var BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-'

function encode64(dataString) {
   var buff = ''
   var outputString = ''
   for (var j = 0; j < dataString.length; j++) {
      var c = dataString.charAt(j)
      var pos
      if (c == ',') {
         pos = 10
      } else if (c == '|') {
         pos = 11
      } else if (c == '.') {
         pos = 12
      } else if (c == ':') {
         pos = 13
      } else {
         pos = parseInt(c)
      }
      buff += CODE[pos]
      if (buff.length >= 6) {
         var seg = buff.slice(0, 6)
         outputString += BASE64.charAt(parseInt(seg, 2))
         buff = buff.slice(6)
      }
   }
   if (buff.length > 0) {
      while (buff.length < 6) {
         buff += '1'
      }
      outputString += BASE64.charAt(parseInt(buff, 2))
   }
   return outputString
}

function decode64(inputString) {
   var dataString = ''
   var buff = ''
   for (var j = 0; j < inputString.length; j++) {
      var inp = BASE64.indexOf(inputString[j]).toString(2)
      while (inp.length < 6) {
         inp = '0' + inp
      }
      buff += inp
      while (buff.length >= 4) {
         var seg = buff.slice(0, 4)
         var pos = CODE.indexOf(seg)
         if (pos == -1) {
            // Padding, do nothing
         }
         else if (pos == 10) {
            dataString += ','
         } else if (pos == 11) {
            dataString += '|'
         } else if (pos == 12) {
            dataString += '.'
         } else if (pos == 13) {
            dataString += ':'
         } else {
            dataString += pos
         }
         buff = buff.slice(4)
      }
   }
   return dataString
}