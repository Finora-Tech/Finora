'use client';

import { Transaction } from "../types";
import { Card } from "./ui/Card";
import { Table } from "./ui/Table";
import { Input, Select } from "./ui/FormComponents";

export function Transactions({ rows }: { rows: Transaction[] }) {
    return (
        <div className="grid gap-6">
            <Card>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">트랜잭션 탐색</h2>
                    <div className="text-xs text-neutral-500">필터/검색 조합 예시</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <Select label="상태">
                        <option>전체</option>
                        <option>OK</option>
                        <option>ERROR</option>
                    </Select>
                    <Select label="채널">
                        <option>전체</option>
                        <option>KakaoBank</option>
                        <option>TossBank</option>
                    </Select>
                    <Input label="최소 금액" placeholder="0" />
                    <Input label="최대 금액" placeholder="1,000,000" />
                </div>
                <Table rows={rows} />
            </Card>
        </div>
    );
}