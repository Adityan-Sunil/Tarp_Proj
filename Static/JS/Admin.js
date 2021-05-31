$(document).ready(() => {
    const Company_ID = {Company_ID: "81afb988-db90-4fd2-b0df-d22ee39406b5"};
    $.post("/company/", Company_ID, (res) => {
        if (res) {
            console.log(res);
            $("#companyName").text(res.company_name);
            $("#companyMemberSince").text(res.company_reg);
            $("#companyMembershipType").text(res.company_mshp);
        }
    });

    $.post("/employee_count/", Company_ID, (res) => {
        if (res) {
            console.log(res);
            $("#numEmployees").text(res.numemployees);
        }
    })
})