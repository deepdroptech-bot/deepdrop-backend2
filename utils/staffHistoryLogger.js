const StaffHistory =
require("../models/staffHistoryModel");

exports.logStaffHistory =
async({

staffId,
action,
userId,
details="",
amount=null,
previousSalary=null,
newSalary=null,
changes={},
session=null

})=>{

await StaffHistory.create([{

staff:staffId,

action,

details,

amount,

previousSalary,

newSalary,

changes,

performedBy:userId

}],{session});

};