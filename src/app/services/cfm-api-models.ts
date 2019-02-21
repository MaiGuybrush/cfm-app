    export interface AlarmList {
        value: string;
        flag_id: string;
    }

    export interface PortList {
        status: string;
        crr_id: string;
        over_time_1: string;
        over_time_2: string;
        port_id: string;
    }

    export interface ToolInfo {
        mode: string;
        status: string;
        type: string;
        shop: string;
        name: string;
        comment: string;
        eqpt_run_mode: string;
        stocker_info?: any;
        empty_cstcnt: string;
        fullrate_freecnt: string;
        pati_info: string;
        stock_set_cnt: string;
        stock_use_cnt: string;
        cr_recipe_id: string;
        prod_cnt: string;
        statusChangeDate?: any;
        moveCount: string;
        status_time?: any;
        change_date?: any;
        alarm_list: AlarmList[];
        port_list: PortList[];
        id: string;
    }
