import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    ResponsiveContainer,
    Cell,
    LabelList
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import * as db from '@/lib/db';
import { Skeleton } from '@/components/ui/skeleton';
import { BookData } from '@/types/book';

interface LeitnerChartDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookId: string;
}

// Order for the chart display
const chartDisplayOrder = [0, 1, 2, 3, 4, 5, 6];

export default function LeitnerChartDialog({
    open,
    onOpenChange,
    bookId
}: LeitnerChartDialogProps) {
    const { t } = useTranslation();
    const [chartData, setChartData] = useState<{ name: string; value: number; label: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const levelLabels: { [key: number]: string } = {
        0: t('bookReport.level.0'),
        1: t('bookReport.level.1'),
        2: t('bookReport.level.2'),
        3: t('bookReport.level.3'),
        4: t('bookReport.level.4'),
        5: t('bookReport.level.5'),
        6: t('bookReport.level.6'),
    };

    useEffect(() => {
        if (!open) return;

        let isMounted = true;
        const fetchStats = async () => {
            setIsLoading(true);
            setChartData([]);

            if (!bookId) {
                setIsLoading(false);
                return;
            }

            try {
                await db.initDB();
                const stats = await db.getLeitnerStatsForBook(bookId);
                const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
                let finalStats = { ...stats };

                if (totalStats === 0) {
                     const bookBlob = await db.getBook(bookId);
                     if (bookBlob) {
                         const jsonText = await bookBlob.text();
                         const bookData: BookData = JSON.parse(jsonText);
                         let total = 0;
                         bookData.forEach(l => total += (l.listWord?.length || 0));
                         finalStats[0] = total;
                     }
                }

                if (isMounted) {
                    const formattedData = chartDisplayOrder.map(level => ({
                        name: levelLabels[level],
                        value: finalStats[level] || 0,
                        label: levelLabels[level],
                    }));
                    setChartData(formattedData);
                }
            } catch (err) {
                console.error(`Error loading stats for ${bookId}:`, err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchStats();
        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookId, open, t]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[calc(100%-2rem)] mx-auto rounded-[2rem] p-6 bg-white dark:bg-gray-800" dir="rtl">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-4">
                    {t('leitnerBoxes.title')}
                </h2>

                <div className="w-full h-[400px] flex items-end justify-center">
                    {isLoading ? (
                        <Skeleton className="w-full h-full rounded-xl" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                                barSize={32}
                            >
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[4, 4, 0, 0]}
                                >
                                    <LabelList
                                        dataKey="value"
                                        position="top"
                                        offset={10}
                                        formatter={(value: number) => (value > 0 ? value : '')}
                                        fill="#374151"
                                        fontSize={12}
                                        fontWeight="bold"
                                    />
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill="#FDBA74"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                     {!isLoading && chartData.every(d => d.value === 0) && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                            {t('bookReport.noData')}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
