export type Action = 
    | { type: "UPDATE"; payload: Record<string, any> }
    | { type: "NEXT_BUTTON" }
    | { type: "BACK_BUTTON" }
    | { type: "SET_STEP"; payload: number }
    | { type: "RESET" }
    | { type: "SET_TEMPORARY_NEXT_CALLBACK"; payload: () => void }
    | { type: "SET_TEMPORARY_BACK_CALLBACK"; payload: () => void }
    ;
