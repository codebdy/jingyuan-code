const assetPathPrefix = "https://www.figma.com/api/mcp/asset/3065e83c-8d4a-4fad-9335-24af6659928b";
const imgIconoirSearch = `${assetPathPrefix}/4da08.svg`;
const imgGroup = `${assetPathPrefix}/c2cdd.svg`;

export default function Group19() {
  return (
    <div className="contents relative size-full" data-node-id="273:1228">
      <div className="[word-break:break-word] absolute capitalize content-stretch flex font-['Inter_Tight:Medium'] gap-[53px] items-center leading-[normal] left-[120px] not-italic text-[18px] top-[56px] tracking-[-0.36px] whitespace-nowrap" data-node-id="273:1229">
        <p className="relative shrink-0 text-[#1e1e1e]" data-node-id="273:1230">
          Applications and Case Studies
        </p>
        <p className="relative shrink-0 text-[#1e1e1e]" data-node-id="273:1231">
          products +
        </p>
        <p className="relative shrink-0 text-[#e0452d]" data-node-id="273:1232">
          Quality Manufacturing
        </p>
        <p className="relative shrink-0 text-[#1e1e1e]" data-node-id="273:1233">
          About Jingyuan
        </p>
        <p className="relative shrink-0 text-[#1e1e1e]" data-node-id="273:1234">
          news
        </p>
        <p className="relative shrink-0 text-[#1e1e1e]" data-node-id="273:1235">
          service support
        </p>
        <p className="relative shrink-0 text-[#1e1e1e]" data-node-id="273:1236">
          contact
        </p>
      </div>
      <div className="absolute content-stretch flex gap-[37px] items-center left-[calc(83.33%+53px)] top-[56px]" data-node-id="273:1237">
        <div className="relative shrink-0 size-[24px]" data-node-id="273:1238" data-name="iconoir:search">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconoirSearch} />
        </div>
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-node-id="273:1245">
          <p className="[word-break:break-word] capitalize col-1 font-['Inter_Tight:Regular'] leading-[normal] ml-0 mt-0 not-italic relative row-1 text-[#1e1e1e] text-[18px] tracking-[-0.45px] whitespace-nowrap" data-node-id="273:1246">
            inquiry
          </p>
          <div className="col-1 ml-[62px] mt-0 overflow-clip relative row-1 size-[24px]" data-node-id="273:1247" data-name="andrsrxn:message-sound-wave">
            <div className="absolute inset-[9.42%_7.37%_8.77%_7.53%]" data-node-id="273:1248" data-name="Group">
              <div className="absolute inset-[-3.82%_-3.67%]">
                <img alt="" className="block max-w-none size-full" src={imgGroup} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
