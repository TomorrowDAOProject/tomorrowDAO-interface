function getNameInitials(contractName) {
  if (!contractName) return [];
  var words = contractName.trim().split(/\s+/);
  return words.map(function(word) {
    return word.charAt(0).toLowerCase();
  });
}

export default function sortContracts(contracts) {
  return contracts.sort(function(a, b) {
    // rule1: type SYSTEM_CONTRACT first
    var aIsSystem = a.type === 'SYSTEM_CONTRACT';
    var bIsSystem = b.type === 'SYSTEM_CONTRACT';
    if (aIsSystem && !bIsSystem) return -1;
    if (!aIsSystem && bIsSystem) return 1;
    // rule2: contractName 
    var aHasName = a.contractName && a.contractName.trim().length > 0;
    var bHasName = b.contractName && b.contractName.trim().length > 0;
    if (aHasName && !bHasName) return -1;
    if (!aHasName && bHasName) return 1;
    // rule3：contractName first chart
    if (aHasName && bHasName) {
      var initialsA = getNameInitials(a.contractName);
      var initialsB = getNameInitials(b.contractName);
      
      var letterA1 = initialsA[0] || '';
      var letterB1 = initialsB[0] || '';
      if (letterA1 !== letterB1) {
        return letterA1.localeCompare(letterB1);
      }
      // rule3：contractName second chart
      var letterA2 = initialsA[1] || '';
      var letterB2 = initialsB[1] || '';
      if (letterA2 !== letterB2) {
        return letterA2.localeCompare(letterB2);
      }
      // all name
      var nameA = a.contractName?.toLowerCase();
      var nameB = b.contractName?.toLowerCase();
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB);
      }
    }
    // rule4：base as address
    return a.address?.toLowerCase()?.localeCompare(b.address?.toLowerCase());
  });
}
