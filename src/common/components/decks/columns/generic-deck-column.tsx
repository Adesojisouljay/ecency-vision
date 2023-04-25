import React, { useContext, useEffect, useState } from "react";
import { _t } from "../../../i18n";
import { DeckHeader } from "../header/deck-header";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useMappedStore } from "../../../store/use-mapped-store";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from "react-virtualized";
import { DeckGridContext } from "../deck-manager";
import { Button } from "react-bootstrap";
import { upArrowSvg } from "../../../img/svg";

type DataItem = Omit<any, "id"> & Required<{ id: string | number }>;

export interface DeckProps {
  id: string;
  header: {
    title: string;
    subtitle: string;
    icon: any;
    updateIntervalMs: number;
    setUpdateIntervalMs: (v: number) => void;
  };
  data: DataItem[];
  onReload: () => void;
  draggable?: DraggableProvidedDragHandleProps;
  isReloading: boolean;
  children: (item: any, measure: Function, index: number) => JSX.Element;
  skeletonItem: JSX.Element;
  contentViewer?: JSX.Element;
  isExpanded?: boolean;
  overlay?: JSX.Element;
}

export const GenericDeckColumn = ({
  header,
  data,
  onReload,
  draggable,
  isReloading,
  children,
  skeletonItem,
  id,
  contentViewer,
  isExpanded,
  overlay
}: DeckProps) => {
  const { activeUser } = useMappedStore();

  const { deleteColumn } = useContext(DeckGridContext);

  const [visibleData, setVisibleData] = useState<DataItem[]>([]);
  const [newComingData, setNewComingData] = useState<DataItem[]>([]);

  const cache = new CellMeasurerCache({
    defaultHeight: 431,
    fixedWidth: true,
    defaultWidth: Math.min(400, window.innerWidth)
  });

  useEffect(() => {
    if (visibleData.length === 0) {
      setVisibleData(data);
    } else {
      const newData = data.filter(({ id }) => !visibleData.some((vd) => vd.id === id));
      setNewComingData(newData);
    }
  }, [data]);

  return (
    <div
      className={`deck ${
        header.title.includes(_t("decks.notifications")) ? "list-body pb-0" : ""
      } ${isExpanded ? "expanded" : ""}`}
    >
      <DeckHeader
        draggable={draggable}
        sticky={true}
        account={activeUser ? activeUser.username : ""}
        {...header}
        onRemove={() => deleteColumn(id)}
        onReload={onReload}
        isReloading={isReloading}
      />
      <div
        className={`item-container position-relative h-100 ${
          header.title.includes("Wallet") ? "transaction-list" : ""
        }`}
      >
        <div className={"new-coming-data " + (newComingData.length > 0 ? "active" : "")}>
          <Button
            variant="primary"
            onClick={() => {
              setVisibleData([...newComingData, ...visibleData]);
              setNewComingData([]);
            }}
          >
            {upArrowSvg}
            {_t("decks.columns.new-data-available")}
          </Button>
        </div>
        {data.length ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                overscanRowCount={0}
                height={height}
                width={width}
                rowCount={visibleData.length}
                rowRenderer={({ key, index, style, parent }) => (
                  <CellMeasurer
                    cache={cache}
                    columnIndex={0}
                    key={key}
                    parent={parent}
                    rowIndex={index}
                  >
                    {({ measure, registerChild }) => (
                      <div ref={registerChild as any} className="virtual-list-item" style={style}>
                        {children(visibleData[index], measure, index)}
                      </div>
                    )}
                  </CellMeasurer>
                )}
                deferredMeasurementCache={cache}
                rowHeight={cache.rowHeight}
              />
            )}
          </AutoSizer>
        ) : (
          <div className="skeleton-list">
            {Array.from(Array(20).keys()).map((i) => (
              <div key={i}>{skeletonItem}</div>
            ))}
          </div>
        )}
        {contentViewer}
        {overlay && <div className="deck-overlay">{overlay}</div>}
      </div>
    </div>
  );
};