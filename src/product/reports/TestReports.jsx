import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import React from "react";

const TestReports = () => {
  return (
    <div className="bg-white  flex justify-between">
      <Select>
             <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder="selet" />
      </SelectTrigger>
        <SelectContent position="popper">
        <SelectGroup>
            <SelectItem value="YES">Yes</SelectItem>
            <SelectItem value="YES">Yes</SelectItem>
            <SelectItem value="YES">Yes</SelectItem>
            <SelectItem value="YES">Yes</SelectItem>
        </SelectGroup>
        </SelectContent>
      </Select>
      <Select></Select>
      <Button>Create Report</Button>
    </div>
  );
};

export default TestReports;
