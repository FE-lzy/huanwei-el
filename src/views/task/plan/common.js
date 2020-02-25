import _func from "@/func/main";

export function getShifts(Code) {
    _func.post("/jobPlan/list", {
        jobTypeCode: Code
    }, "token").then(res => {
        return res
    });
}
